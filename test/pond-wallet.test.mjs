import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { createWalletBridge } from '../pond/wallet-bridge.mjs';
const address='0x'+'12'.repeat(20);
const wallet={request:async()=>[address]};
function bridge(sdk,browser={},extra={}){return createWalletBridge({browser,loadSdk:async()=>({sdk}),timeoutMs:15,...extra});}
test('normal browser does not use the SDK fake host provider',async()=>{
 let calls=0;
 const sdk={isInMiniApp:async()=>false,wallet:{getEthereumProvider:async()=>{calls++;throw new Error("Cannot read properties of undefined (reading 'error')");}}};
 const result=await bridge(sdk,{ethereum:wallet}).connect();
 assert.equal(result.provider,wallet);assert.equal(result.mode,'Browser');assert.equal(calls,0);
});
test('verified mini app uses its real host wallet',async()=>{
 let ready=0;
 const sdk={isInMiniApp:async()=>true,actions:{ready:async()=>ready++},wallet:{getEthereumProvider:async()=>wallet}};
 const result=await bridge(sdk).connect();assert.equal(result.mode,'Mini App');assert.equal(ready,1);
});
test('SDK load or host detection timeout leaves browser wallet usable',async()=>{
 for(const loadSdk of [()=>new Promise(()=>{}),async()=>({sdk:{isInMiniApp:()=>new Promise(()=>{})}}),async()=>{throw Error('CDN unavailable')}]){
  const result=await createWalletBridge({browser:{ethereum:wallet},loadSdk,timeoutMs:10}).connect();assert.equal(result.address,address);
 }
});
test('host provider acquisition failure falls back to browser',async()=>{
 const sdk={isInMiniApp:async()=>true,wallet:{getEthereumProvider:()=>new Promise(()=>{})}};
 assert.equal((await bridge(sdk,{ethereum:wallet}).connect()).provider,wallet);
});
test('broken provider RPC falls back to another real extension',async()=>{
 const broken={request:async()=>{throw Error('bad bridge')}};
 assert.equal((await bridge(null,{ethereum:broken,coinbaseWalletExtension:wallet}).connect()).provider,wallet);
});
test('user rejection never triggers another connection prompt',async()=>{
 let second=0;
 const denied={request:async()=>{throw Object.assign(Error('Rejected'),{code:4001})}};
 const other={request:async()=>{second++;return [address]}};
 await assert.rejects(bridge(null,{ethereum:denied,coinbaseWalletExtension:other}).connect(),{code:4001});assert.equal(second,0);
});
test('missing wallet and malformed addresses do not simulate connection',async()=>{
 await assert.rejects(bridge(null).connect(),/No wallet detected/);
 await assert.rejects(bridge(null,{ethereum:{request:async()=>['not-an-address']}}).connect(),/valid account/);
});
test('sharing outside mini app does not call the host composer',async()=>{
 let calls=0;
 const sdk={isInMiniApp:async()=>false,actions:{composeCast:async()=>calls++}};
 assert.equal(await bridge(sdk).composeCast({text:'reflection'}),'unavailable');assert.equal(calls,0);
});
test('native composer distinguishes posting from cancellation',async()=>{
 for(const [result,expected] of [[{cast:{hash:'0xabc'}},'posted'],[{cast:null},'cancelled']]){
  const sdk={isInMiniApp:async()=>true,actions:{composeCast:async()=>result}};
  assert.equal(await bridge(sdk).composeCast({text:'reflection'}),expected);
 }
});
test('a live composer can wait longer than host detection timeout',async()=>{
 const sdk={isInMiniApp:async()=>true,actions:{composeCast:()=>new Promise(resolve=>setTimeout(()=>resolve({cast:{hash:'0xabc'}}),35))}};
 assert.equal(await bridge(sdk).composeCast({text:'reflection'}),'posted');
});
test('all Pond inline scripts parse after integration',()=>{
 const html=readFileSync(new URL('../pond/index.html',import.meta.url),'utf8');
 for(const [,attributes,source] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(attributes.includes('type="module"')){
   // Module parsing is checked separately by node --check.
   writeFileSync('/tmp/pond-inline-wallet-check.mjs',source);
  }else if(!attributes.includes('src='))new vm.Script(source);
 }
 assert.ok(html.includes('walletBridge.connect(selectedWallet)'));
 assert.ok(!html.includes('const mockAddress'));
 assert.ok(!html.includes('Please connect wallet first.'));
});

test('EIP-6963 discovers named wallets even without window.ethereum',async()=>{
 const events=new EventTarget();
 const browser={addEventListener:events.addEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)};
 events.addEventListener('eip6963:requestProvider',()=>{
  const event=new Event('eip6963:announceProvider');
  event.detail={info:{name:'Rabby Wallet'},provider:wallet};events.dispatchEvent(event);
 });
 const b=bridge(null,browser);const list=await b.listWallets();
 assert.equal(list.length,1);assert.equal(list[0].name,'Rabby Wallet');
 assert.equal((await b.connect(list[0])).address,address);
});
test('explicit wallet selection does not prompt the other installed extension',async()=>{
 let first=0,second=0;
 const p1={request:async()=>{first++;return[address]}};
 const p2={request:async()=>{second++;return[address]}};
 const b=bridge(null,{ethereum:{providers:[p1,p2]}});const list=await b.listWallets();
 await b.connect(list[1]);assert.equal(first,0);assert.equal(second,1);
});
test('announced provider takes precedence over conflicting legacy injection',async()=>{
 const events=new EventTarget();let unwanted=0;
 const browser={ethereum:{request:async()=>{unwanted++;throw Error('Wrong wallet')}},addEventListener:events.addEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)};
 const b=bridge(null,browser);const event=new Event('eip6963:announceProvider');
 event.detail={info:{name:'MetaMask'},provider:wallet};events.dispatchEvent(event);
 const list=await b.listWallets();assert.equal(list.length,1);assert.equal(list[0].provider,wallet);
 await b.connect(list[0]);assert.equal(unwanted,0);
});

function uiHarness(wallets) {
 const nodes=new Map(),dialogs=[];let chosen=null;
 function element(){return {hidden:true,children:[],handlers:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},append(...items){this.children.push(...items)},addEventListener(name,fn){this.handlers[name]=fn},showModal(){dialogs.push(this)},close(){},remove(){}};}
 const bridge={initialize:async()=>null,listWallets:async()=>wallets,connect:async selection=>{chosen=selection;return{address,provider:selection.provider,name:selection.name,mode:'Browser'}}};
 const document={getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},createElement:element,body:{append(){}}};
 const browser={addEventListener(){},showStatusMessage(){}};
 const html=readFileSync(new URL('../pond/index.html',import.meta.url),'utf8');
 const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].find(x=>x[1].includes('type="module"'))[2];
 const boot=source.slice(0,source.indexOf('    dropBtn.addEventListener')).replace(/import .*?;\n/,'');
 vm.runInNewContext(boot,{document,window:browser,createWalletBridge:()=>bridge,console});
 return {nodes,dialogs,getChosen:()=>chosen};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('no-wallet browser hides Connect Wallet without a failure message',async()=>{
 const ui=uiHarness([]);await flush();assert.equal(ui.nodes.get('wallet-btn').hidden,true);assert.equal(ui.getChosen(),null);
});
test('browser UI chooses an installed wallet before requesting connection',async()=>{
 const entries=[{name:'MetaMask',provider:{}},{name:'Rabby Wallet',provider:{}}];
 const ui=uiHarness(entries);await flush();const button=ui.nodes.get('wallet-btn');assert.equal(button.hidden,false);
 const pending=button.handlers.click();await flush();assert.equal(ui.getChosen(),null);
 const dialog=ui.dialogs[0];assert.equal(dialog.children[3].textContent,'Rabby Wallet');
 dialog.children[3].handlers.click();await pending;assert.equal(ui.getChosen(),entries[1]);assert.equal(button.disabled,false);
 assert.match(button.textContent,/Rabby Wallet/);
});
