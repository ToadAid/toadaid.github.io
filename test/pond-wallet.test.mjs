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
 assert.ok(html.includes('walletBridge.connect()'));
 assert.ok(!html.includes('const mockAddress'));
 assert.ok(!html.includes('Please connect wallet first.'));
});
