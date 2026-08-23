import{A as e,C as t,D as n,E as r,G as i,K as a,L as o,M as s,P as c,R as ee,T as te,Y as l,_ as u,a as ne,b as d,c as re,f as ie,g as ae,h as f,j as oe,k as se,l as p,m as ce,o as le,p as ue,q as m,r as h,s as de,t as fe,w as g,y as _,z as pe}from"./ApiController-MQ_IDqcO.js";import{a as v,c as y,g as me,i as he,l as ge,m as b,r as _e,t as x,u as S,y as ve}from"./HelpersUtil-BjAXC9Cw.js";import{c as ye,l as C,n as be,o as w,s as T,t as xe,u as E}from"./wui-list-item-BlNtW_tJ.js";import{n as Se,t as Ce}from"./AlertController-Cff-pgNn.js";var we={getGasPriceInEther(e,t){let n=t*e;return Number(n)/0xde0b6b3a7640000},getGasPriceInUSD(e,t,n){let r=we.getGasPriceInEther(t,n);return m.bigNumber(e).times(r).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:n,toTokenAmount:r}){let i=m.bigNumber(e).times(t),a=m.bigNumber(r).times(n);return i.minus(a).div(i).times(100).toNumber()},getMaxSlippage(e,t){let n=m.bigNumber(e).div(100);return m.multiply(t,n).toNumber()},getProviderFee(e,t=.0085){return m.bigNumber(e).times(t).toString()},isInsufficientNetworkTokenForGas(e,t){let n=t||`0`;return m.bigNumber(e).eq(0)?!0:m.bigNumber(m.bigNumber(n)).gt(e)},isInsufficientSourceTokenForSwap(e,t,n){let r=n?.find(e=>e.address===t)?.quantity?.numeric;return m.bigNumber(r||`0`).lt(e)}},Te=15e4,D={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:``,sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:``,toTokenPriceInUSD:0,networkPrice:`0`,networkBalanceInUSD:`0`,networkTokenSymbol:``,inputError:void 0,slippage:c.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:`0`,gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},O=ee({...D}),Ee={state:O,subscribe(e){return pe(O,()=>e(O))},subscribeKey(e,t){return o(O,e,t)},getParams(){let e=h.state.activeChain,t=h.getAccountData(e)?.caipAddress??h.state.activeCaipAddress,n=s.getPlainAddress(t),r=ie(),i=f.getConnectorId(h.state.activeChain);if(!n)throw Error(`No address found to swap the tokens from.`);let a=!O.toToken?.address||!O.toToken?.decimals,o=!O.sourceToken?.address||!O.sourceToken?.decimals||!m.bigNumber(O.sourceTokenAmount).gt(0),c=!O.sourceTokenAmount;return{networkAddress:r,fromAddress:n,fromCaipAddress:t,sourceTokenAddress:O.sourceToken?.address,toTokenAddress:O.toToken?.address,toTokenAmount:O.toTokenAmount,toTokenDecimals:O.toToken?.decimals,sourceTokenAmount:O.sourceTokenAmount,sourceTokenDecimals:O.sourceToken?.decimals,invalidToToken:a,invalidSourceToken:o,invalidSourceTokenAmount:c,availableToSwap:t&&!a&&!o&&!c,isAuthConnector:i===l.CONNECTOR_ID.AUTH}},async setSourceToken(e){if(!e){O.sourceToken=e,O.sourceTokenAmount=``,O.sourceTokenPriceInUSD=0;return}O.sourceToken=e,await k.setTokenPrice(e.address,`sourceToken`)},setSourceTokenAmount(e){O.sourceTokenAmount=e},async setToToken(e){if(!e){O.toToken=e,O.toTokenAmount=``,O.toTokenPriceInUSD=0;return}O.toToken=e,await k.setTokenPrice(e.address,`toToken`)},setToTokenAmount(e){O.toTokenAmount=e?m.toFixed(e,6):``},async setTokenPrice(e,t){let n=O.tokensPriceMap[e]||0;n||=(O.loadingPrices=!0,await k.getAddressPrice(e)),t===`sourceToken`?O.sourceTokenPriceInUSD=n:t===`toToken`&&(O.toTokenPriceInUSD=n),O.loadingPrices&&=!1,k.getParams().availableToSwap&&!O.switchingTokens&&k.swapTokens()},async switchTokens(){if(!(O.initializing||!O.initialized||O.switchingTokens)){O.switchingTokens=!0;try{let e=O.toToken?{...O.toToken}:void 0,t=O.sourceToken?{...O.sourceToken}:void 0,n=e&&O.toTokenAmount===``?`1`:O.toTokenAmount;k.setSourceTokenAmount(n),k.setToTokenAmount(``),await k.setSourceToken(e),await k.setToToken(t),O.switchingTokens=!1,k.swapTokens()}catch(e){throw O.switchingTokens=!1,e}}},resetState(){O.myTokensWithBalance=D.myTokensWithBalance,O.tokensPriceMap=D.tokensPriceMap,O.initialized=D.initialized,O.initializing=D.initializing,O.switchingTokens=D.switchingTokens,O.sourceToken=D.sourceToken,O.sourceTokenAmount=D.sourceTokenAmount,O.sourceTokenPriceInUSD=D.sourceTokenPriceInUSD,O.toToken=D.toToken,O.toTokenAmount=D.toTokenAmount,O.toTokenPriceInUSD=D.toTokenPriceInUSD,O.networkPrice=D.networkPrice,O.networkTokenSymbol=D.networkTokenSymbol,O.networkBalanceInUSD=D.networkBalanceInUSD,O.inputError=D.inputError},resetValues(){let{networkAddress:e}=k.getParams(),t=O.tokens?.find(t=>t.address===e);k.setSourceToken(t),k.setToToken(void 0)},getApprovalLoadingState(){return O.loadingApprovalTransaction},clearError(){O.transactionError=void 0},async initializeState(){if(!O.initializing){if(O.initializing=!0,!O.initialized)try{await k.fetchTokens(),O.initialized=!0}catch{O.initialized=!1,g.showError(`Failed to initialize swap`),d.goBack()}O.initializing=!1}},async fetchTokens(){let{networkAddress:e}=k.getParams();await k.getNetworkTokenPrice(),await k.getMyTokensWithBalance();let t=O.myTokensWithBalance?.find(t=>t.address===e);t&&(O.networkTokenSymbol=t.symbol,k.setSourceToken(t),k.setSourceTokenAmount(`0`))},async getTokenList(){let e=h.state.activeCaipNetwork?.caipNetworkId;if(!(O.caipNetworkId===e&&O.tokens))try{O.tokensLoading=!0;let t=await ne.getTokenList(e);O.tokens=t,O.caipNetworkId=e,O.popularTokens=t.sort((e,t)=>e.symbol<t.symbol?-1:+(e.symbol>t.symbol));let n=(e&&c.SUGGESTED_TOKENS_BY_CHAIN?.[e]||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e),r=(c.SWAP_SUGGESTED_TOKENS||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>!!e).filter(e=>!n.some(t=>t.address===e.address));O.suggestedTokens=[...n,...r]}catch{O.tokens=[],O.popularTokens=[],O.suggestedTokens=[]}finally{O.tokensLoading=!1}},async getAddressPrice(e){let n=O.tokensPriceMap[e];if(n)return n;let r=(await t.fetchTokenPrice({addresses:[e]}))?.fungibles||[],i=[...O.tokens||[],...O.myTokensWithBalance||[]].find(t=>t.address===e)?.symbol,a=r.find(e=>e.symbol.toLowerCase()===i?.toLowerCase())?.price||0,o=parseFloat(a.toString());return O.tokensPriceMap[e]=o,o},async getNetworkTokenPrice(){let{networkAddress:e}=k.getParams(),n=(await t.fetchTokenPrice({addresses:[e]}).catch(()=>(g.showError(`Failed to fetch network token price`),{fungibles:[]}))).fungibles?.[0],r=n?.price.toString()||`0`;O.tokensPriceMap[e]=parseFloat(r),O.networkTokenSymbol=n?.symbol||``,O.networkPrice=r},async getMyTokensWithBalance(e){let t=await re.getMyTokensWithBalance({forceUpdate:e,caipNetwork:h.state.activeCaipNetwork,address:h.getAccountData()?.address}),n=ne.mapBalancesToSwapTokens(t);n&&(await k.getInitialGasPrice(),k.setBalances(n))},setBalances(e){let{networkAddress:t}=k.getParams(),n=h.state.activeCaipNetwork;if(!n)return;let r=e.find(e=>e.address===t);e.forEach(e=>{O.tokensPriceMap[e.address]=e.price||0}),O.myTokensWithBalance=e.filter(e=>e.address.startsWith(n.caipNetworkId)),O.networkBalanceInUSD=r?m.multiply(r.quantity.numeric,r.price).toString():`0`},async getInitialGasPrice(){let e=await ne.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch(h.state?.activeCaipNetwork?.chainNamespace){case l.CHAIN.SOLANA:return O.gasFee=e.standard??`0`,O.gasPriceInUSD=m.multiply(e.standard,O.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(O.gasFee),gasPriceInUSD:Number(O.gasPriceInUSD)};case l.CHAIN.EVM:default:let t=e.standard??`0`,n=BigInt(t),r=BigInt(Te),i=we.getGasPriceInUSD(O.networkPrice,r,n);return O.gasFee=t,O.gasPriceInUSD=i,{gasPrice:n,gasPriceInUSD:i}}},async swapTokens(){let e=h.getAccountData()?.address,n=O.sourceToken,r=O.toToken,i=m.bigNumber(O.sourceTokenAmount).gt(0);if(i||k.setToTokenAmount(``),!r||!n||O.loadingPrices||!i||!e)return;O.loadingQuote=!0;let a=m.bigNumber(O.sourceTokenAmount).times(10**n.decimals).round(0).toFixed(0);try{let i=await t.fetchSwapQuote({userAddress:e,from:n.address,to:r.address,gasPrice:O.gasFee,amount:a.toString()});O.loadingQuote=!1;let o=i?.quotes?.[0]?.toAmount;if(!o){Ce.open({displayMessage:`Incorrect amount`,debugMessage:`Please enter a valid amount`},`error`);return}let s=m.bigNumber(o).div(10**r.decimals).toString();k.setToTokenAmount(s),k.hasInsufficientToken(O.sourceTokenAmount,n.address)?O.inputError=`Insufficient balance`:(O.inputError=void 0,k.setTransactionDetails())}catch(e){let t=await ne.handleSwapError(e);O.loadingQuote=!1,O.inputError=t||`Insufficient balance`}},async getTransaction(){let{fromCaipAddress:e,availableToSwap:t}=k.getParams(),n=O.sourceToken,r=O.toToken;if(!(!e||!t||!n||!r||O.loadingQuote))try{O.loadingBuildTransaction=!0;let t=await ne.fetchSwapAllowance({userAddress:e,tokenAddress:n.address,sourceTokenAmount:O.sourceTokenAmount,sourceTokenDecimals:n.decimals}),r;return r=t?await k.createSwapTransaction():await k.createAllowanceTransaction(),O.loadingBuildTransaction=!1,O.fetchError=!1,r}catch{d.goBack(),g.showError(`Failed to check allowance`),O.loadingBuildTransaction=!1,O.approvalTransaction=void 0,O.swapTransaction=void 0,O.fetchError=!0;return}},async createAllowanceTransaction(){let{fromCaipAddress:e,sourceTokenAddress:n,toTokenAddress:r}=k.getParams();if(!(!e||!r)){if(!n)throw Error(`createAllowanceTransaction - No source token address found.`);try{let i=await t.generateApproveCalldata({from:n,to:r,userAddress:e}),a=s.getPlainAddress(i.tx.from);if(!a)throw Error(`SwapController:createAllowanceTransaction - address is required`);let o={data:i.tx.data,to:a,gasPrice:BigInt(i.tx.eip155.gasPrice),value:BigInt(i.tx.value),toAmount:O.toTokenAmount};return O.swapTransaction=void 0,O.approvalTransaction={data:o.data,to:o.to,gasPrice:o.gasPrice,value:o.value,toAmount:o.toAmount},{data:o.data,to:o.to,gasPrice:o.gasPrice,value:o.value,toAmount:o.toAmount}}catch{d.goBack(),g.showError(`Failed to create approval transaction`),O.approvalTransaction=void 0,O.swapTransaction=void 0,O.fetchError=!0;return}}},async createSwapTransaction(){let{networkAddress:e,fromCaipAddress:n,sourceTokenAmount:r}=k.getParams(),i=O.sourceToken,a=O.toToken;if(!n||!r||!i||!a)return;let o=p.parseUnits(r,i.decimals)?.toString();try{let r=await t.generateSwapCalldata({userAddress:n,from:i.address,to:a.address,amount:o,disableEstimate:!0}),c=i.address===e,ee=BigInt(r.tx.eip155.gas),te=BigInt(r.tx.eip155.gasPrice),l=s.getPlainAddress(r.tx.to);if(!l)throw Error(`SwapController:createSwapTransaction - address is required`);let u={data:r.tx.data,to:l,gas:ee,gasPrice:te,value:BigInt(c?o??`0`:`0`),toAmount:O.toTokenAmount};return O.gasPriceInUSD=we.getGasPriceInUSD(O.networkPrice,ee,te),O.approvalTransaction=void 0,O.swapTransaction=u,u}catch{d.goBack(),g.showError(`Failed to create transaction`),O.approvalTransaction=void 0,O.swapTransaction=void 0,O.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){g.showLoading(`Approve limit increase in your wallet`),d.replace(`SwapPreview`)},async sendTransactionForApproval(e){let{fromAddress:t,isAuthConnector:n}=k.getParams();O.loadingApprovalTransaction=!0,n?d.pushTransactionStack({onSuccess:k.onEmbeddedWalletApprovalSuccess}):g.showLoading(`Approve limit increase in your wallet`);try{await p.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:l.CHAIN.EVM}),await k.swapTokens(),await k.getTransaction(),O.approvalTransaction=void 0,O.loadingApprovalTransaction=!1}catch(e){let t=e;O.transactionError=t?.displayMessage,O.loadingApprovalTransaction=!1,g.showError(t?.displayMessage||`Transaction error`),_.sendEvent({type:`track`,event:`SWAP_APPROVAL_ERROR`,properties:{message:t?.displayMessage||t?.message||`Unknown`,network:h.state.activeCaipNetwork?.caipNetworkId||``,swapFromToken:k.state.sourceToken?.symbol||``,swapToToken:k.state.toToken?.symbol||``,swapFromAmount:k.state.sourceTokenAmount||``,swapToAmount:k.state.toTokenAmount||``,isSmartAccount:ce(l.CHAIN.EVM)===te.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){if(!e)return;let{fromAddress:t,toTokenAmount:n,isAuthConnector:r}=k.getParams();O.loadingTransaction=!0;let i=`Swapping ${O.sourceToken?.symbol} to ${m.formatNumberToLocalString(n,3)} ${O.toToken?.symbol}`,a=`Swapped ${O.sourceToken?.symbol} to ${m.formatNumberToLocalString(n,3)} ${O.toToken?.symbol}`;r?d.pushTransactionStack({onSuccess(){d.replace(`Account`),g.showLoading(i),Ee.resetState()}}):g.showLoading(`Confirm transaction in your wallet`);try{let n=[O.sourceToken?.address,O.toToken?.address].join(`,`),i=await p.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:l.CHAIN.EVM});return O.loadingTransaction=!1,g.showSuccess(a),_.sendEvent({type:`track`,event:`SWAP_SUCCESS`,properties:{network:h.state.activeCaipNetwork?.caipNetworkId||``,swapFromToken:k.state.sourceToken?.symbol||``,swapToToken:k.state.toToken?.symbol||``,swapFromAmount:k.state.sourceTokenAmount||``,swapToAmount:k.state.toTokenAmount||``,isSmartAccount:ce(l.CHAIN.EVM)===te.ACCOUNT_TYPES.SMART_ACCOUNT}}),Ee.resetState(),r||d.replace(`Account`),Ee.getMyTokensWithBalance(n),i}catch(e){let t=e;O.transactionError=t?.displayMessage,O.loadingTransaction=!1,g.showError(t?.displayMessage||`Transaction error`),_.sendEvent({type:`track`,event:`SWAP_ERROR`,properties:{message:t?.displayMessage||t?.message||`Unknown`,network:h.state.activeCaipNetwork?.caipNetworkId||``,swapFromToken:k.state.sourceToken?.symbol||``,swapToToken:k.state.toToken?.symbol||``,swapFromAmount:k.state.sourceTokenAmount||``,swapToAmount:k.state.toTokenAmount||``,isSmartAccount:ce(l.CHAIN.EVM)===te.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken(e,t){return we.isInsufficientSourceTokenForSwap(e,t,O.myTokensWithBalance)},setTransactionDetails(){let{toTokenAddress:e,toTokenDecimals:t}=k.getParams();!e||!t||(O.gasPriceInUSD=we.getGasPriceInUSD(O.networkPrice,BigInt(O.gasFee),BigInt(Te)),O.priceImpact=we.getPriceImpact({sourceTokenAmount:O.sourceTokenAmount,sourceTokenPriceInUSD:O.sourceTokenPriceInUSD,toTokenPriceInUSD:O.toTokenPriceInUSD,toTokenAmount:O.toTokenAmount}),O.maxSlippage=we.getMaxSlippage(O.slippage,O.toTokenAmount),O.providerFee=we.getProviderFee(O.sourceTokenAmount))}},k=se(Ee),A=ee({message:``,open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:`shade`}),j=se({state:A,subscribe(e){return pe(A,()=>e(A))},subscribeKey(e,t){return o(A,e,t)},showTooltip({message:e,triggerRect:t,variant:n}){A.open=!0,A.message=e,A.triggerRect=t,A.variant=n},hide(){A.open=!1,A.message=``,A.triggerRect={width:0,height:0,top:0,left:0}}}),De={isUnsupportedChainView(){return d.state.view===`UnsupportedChain`||d.state.view===`SwitchNetwork`&&d.state.history.includes(`UnsupportedChain`)},async safeClose(){if(this.isUnsupportedChainView()){u.shake();return}if(await Se.isSIWXCloseDisabled()){u.shake();return}(d.state.view===`DataCapture`||d.state.view===`DataCaptureOtpConfirm`)&&p.disconnect(),u.close()}},Oe={interpolate(e,t,n){if(e.length!==2||t.length!==2)throw Error(`inputRange and outputRange must be an array of length 2`);let r=e[0]||0,i=e[1]||0,a=t[0]||0,o=t[1]||0;return n<r?a:n>i?o:(o-a)/(i-r)*(n-r)+a}},ke=y`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:e})=>e[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    overflow: hidden;
  }
`,Ae=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},je=class extends S{render(){return b`<slot></slot>`}};je.styles=[v,ke],je=Ae([T(`wui-card`)],je);var Me=y`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[6]};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:e})=>e.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundError};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: var(--local-icon-bg-value);
  }
`,Ne=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Pe={info:`info`,success:`checkmark`,warning:`warningCircle`,error:`warning`},Fe=class extends S{constructor(){super(...arguments),this.message=``,this.type=`info`}render(){return b`
      <wui-flex
        data-type=${w(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${Pe[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){Ce.close()}};Fe.styles=[v,Me],Ne([E()],Fe.prototype,`message`,void 0),Ne([E()],Fe.prototype,`type`,void 0),Fe=Ne([T(`wui-alertbar`)],Fe);var Ie=y`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:e})=>e[3]};
    left: ${({spacing:e})=>e[4]};
    right: ${({spacing:e})=>e[4]};
    opacity: 0;
    pointer-events: none;
  }
`,Le=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Re={info:{backgroundColor:`fg-350`,iconColor:`fg-325`,icon:`info`},success:{backgroundColor:`success-glass-reown-020`,iconColor:`success-125`,icon:`checkmark`},warning:{backgroundColor:`warning-glass-reown-020`,iconColor:`warning-100`,icon:`warningCircle`},error:{backgroundColor:`error-glass-reown-020`,iconColor:`error-125`,icon:`warning`}},ze=class extends S{constructor(){super(),this.unsubscribe=[],this.open=Ce.state.open,this.onOpen(!0),this.unsubscribe.push(Ce.subscribeKey(`open`,e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=Ce.state,n=Re[t];return b`
      <wui-alertbar
        message=${e}
        backgroundColor=${n?.backgroundColor}
        iconColor=${n?.iconColor}
        icon=${n?.icon}
        type=${t}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:`scale(0.85)`},{opacity:1,transform:`scale(1)`}],{duration:150,fill:`forwards`,easing:`ease`}),this.style.cssText=`pointer-events: auto`):e||(this.animate([{opacity:1,transform:`scale(1)`},{opacity:0,transform:`scale(0.85)`}],{duration:150,fill:`forwards`,easing:`ease`}),this.style.cssText=`pointer-events: none`)}};ze.styles=Ie,Le([C()],ze.prototype,`open`,void 0),ze=Le([T(`w3m-alertbar`)],ze);var Be=y`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,Ve=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},M=class extends S{constructor(){super(...arguments),this.icon=`card`,this.variant=`primary`,this.type=`accent`,this.size=`md`,this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return b`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${w(this.iconSize)}></wui-icon>
    </button>`}};M.styles=[v,_e,Be],Ve([E()],M.prototype,`icon`,void 0),Ve([E()],M.prototype,`variant`,void 0),Ve([E()],M.prototype,`type`,void 0),Ve([E()],M.prototype,`size`,void 0),Ve([E()],M.prototype,`iconSize`,void 0),Ve([E({type:Boolean})],M.prototype,`fullWidth`,void 0),Ve([E({type:Boolean})],M.prototype,`disabled`,void 0),M=Ve([T(`wui-icon-button`)],M);var He=y`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:e})=>e[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    opacity: 0.5;
  }
`,Ue=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},We={lg:`lg-regular`,md:`md-regular`,sm:`sm-regular`},Ge={lg:`lg`,md:`md`,sm:`sm`},Ke=class extends S{constructor(){super(...arguments),this.imageSrc=``,this.text=``,this.size=`lg`,this.type=`text-dropdown`,this.disabled=!1}render(){return b`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){let e=We[this.size];return this.text?b`<wui-text color="primary" variant=${e}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return b`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;let e=Ge[this.size];return b` <wui-flex class="left-icon-container">
      <wui-icon size=${e} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};Ke.styles=[v,_e,He],Ue([E()],Ke.prototype,`imageSrc`,void 0),Ue([E()],Ke.prototype,`text`,void 0),Ue([E()],Ke.prototype,`size`,void 0),Ue([E()],Ke.prototype,`type`,void 0),Ue([E({type:Boolean})],Ke.prototype,`disabled`,void 0),Ke=Ue([T(`wui-select`)],Ke);var qe={ACCOUNT_TABS:[{label:`Tokens`},{label:`Activity`}],SECURE_SITE_ORIGIN:(typeof process<`u`?{}.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||`https://secure.walletconnect.org`,VIEW_DIRECTION:{Next:`next`,Prev:`prev`},ANIMATION_DURATIONS:{HeaderText:120,ModalHeight:150,ViewTransition:150},VIEWS_WITH_LEGAL_FOOTER:[`Connect`,`ConnectWallets`,`OnRampTokenSelect`,`OnRampFiatSelect`,`OnRampProviders`],VIEWS_WITH_DEFAULT_FOOTER:[`Networks`]},Je=y`
  button {
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  button[data-variant='accent']:hover:enabled,
  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button[data-variant='primary']:hover:enabled,
  button[data-variant='primary']:focus-visible,
  button[data-variant='secondary']:hover:enabled,
  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button[data-size='xs'] > wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='xs'],
  button[data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'],
  button[data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='md'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button:disabled {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:hover:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
  }

  button:focus-visible:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
`,Ye=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},N=class extends S{constructor(){super(...arguments),this.size=`md`,this.disabled=!1,this.icon=`copy`,this.iconColor=`default`,this.variant=`accent`}render(){return b`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${{accent:`accent-primary`,primary:`inverse`,secondary:`default`}[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};N.styles=[v,_e,Je],Ye([E()],N.prototype,`size`,void 0),Ye([E({type:Boolean})],N.prototype,`disabled`,void 0),Ye([E()],N.prototype,`icon`,void 0),Ye([E()],N.prototype,`iconColor`,void 0),Ye([E()],N.prototype,`variant`,void 0),N=Ye([T(`wui-icon-link`)],N);var Xe=me`<svg width="86" height="96" fill="none">
  <path
    d="M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z"
  />
</svg>`,Ze=me`
  <svg fill="none" viewBox="0 0 36 40">
    <path
      d="M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z"
    />
  </svg>
`,Qe=y`
  :host {
    position: relative;
    border-radius: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-width);
    height: var(--local-height);
  }

  :host([data-round='true']) {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: 100%;
    outline: 1px solid ${({tokens:e})=>e.core.glass010};
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  svg > path {
    stroke: var(--local-stroke);
  }

  wui-image {
    width: 100%;
    height: 100%;
    -webkit-clip-path: var(--local-path);
    clip-path: var(--local-path);
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon {
    transform: translateY(-5%);
    width: var(--local-icon-size);
    height: var(--local-icon-size);
  }
`,$e=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},P=class extends S{constructor(){super(...arguments),this.size=`md`,this.name=`uknown`,this.networkImagesBySize={sm:Ze,md:xe,lg:Xe},this.selected=!1,this.round=!1}render(){let e={sm:`4`,md:`6`,lg:`10`};return this.round?(this.dataset.round=`true`,this.style.cssText=`
      --local-width: var(--apkt-spacing-10);
      --local-height: var(--apkt-spacing-10);
      --local-icon-size: var(--apkt-spacing-4);
    `):this.style.cssText=`

      --local-path: var(--apkt-path-network-${this.size});
      --local-width:  var(--apkt-width-network-${this.size});
      --local-height:  var(--apkt-height-network-${this.size});
      --local-icon-size:  var(--apkt-spacing-${e[this.size]});
    `,b`${this.templateVisual()} ${this.svgTemplate()} `}svgTemplate(){return this.round?null:this.networkImagesBySize[this.size]}templateVisual(){return this.imageSrc?b`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:b`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};P.styles=[v,Qe],$e([E()],P.prototype,`size`,void 0),$e([E()],P.prototype,`name`,void 0),$e([E({type:Object})],P.prototype,`networkImagesBySize`,void 0),$e([E()],P.prototype,`imageSrc`,void 0),$e([E({type:Boolean})],P.prototype,`selected`,void 0),$e([E({type:Boolean})],P.prototype,`round`,void 0),P=$e([T(`wui-network-image`)],P);var et=y`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 1px;
    background-color: ${({tokens:e})=>e.theme.borderPrimary};
    justify-content: center;
    align-items: center;
  }

  :host > wui-text {
    position: absolute;
    padding: 0px 8px;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  :host([data-bg-color='primary']) > wui-text {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  :host([data-bg-color='secondary']) > wui-text {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }
`,tt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},nt=class extends S{constructor(){super(...arguments),this.text=``,this.bgColor=`primary`}render(){return this.dataset.bgColor=this.bgColor,b`${this.template()}`}template(){return this.text?b`<wui-text variant="md-regular" color="secondary">${this.text}</wui-text>`:null}};nt.styles=[v,et],tt([E()],nt.prototype,`text`,void 0),tt([E()],nt.prototype,`bgColor`,void 0),nt=tt([T(`wui-separator`)],nt);var F={INVALID_PAYMENT_CONFIG:`INVALID_PAYMENT_CONFIG`,INVALID_RECIPIENT:`INVALID_RECIPIENT`,INVALID_ASSET:`INVALID_ASSET`,INVALID_AMOUNT:`INVALID_AMOUNT`,UNKNOWN_ERROR:`UNKNOWN_ERROR`,UNABLE_TO_INITIATE_PAYMENT:`UNABLE_TO_INITIATE_PAYMENT`,INVALID_CHAIN_NAMESPACE:`INVALID_CHAIN_NAMESPACE`,GENERIC_PAYMENT_ERROR:`GENERIC_PAYMENT_ERROR`,UNABLE_TO_GET_EXCHANGES:`UNABLE_TO_GET_EXCHANGES`,ASSET_NOT_SUPPORTED:`ASSET_NOT_SUPPORTED`,UNABLE_TO_GET_PAY_URL:`UNABLE_TO_GET_PAY_URL`,UNABLE_TO_GET_BUY_STATUS:`UNABLE_TO_GET_BUY_STATUS`,UNABLE_TO_GET_TOKEN_BALANCES:`UNABLE_TO_GET_TOKEN_BALANCES`,UNABLE_TO_GET_QUOTE:`UNABLE_TO_GET_QUOTE`,UNABLE_TO_GET_QUOTE_STATUS:`UNABLE_TO_GET_QUOTE_STATUS`,INVALID_RECIPIENT_ADDRESS_FOR_ASSET:`INVALID_RECIPIENT_ADDRESS_FOR_ASSET`},I={[F.INVALID_PAYMENT_CONFIG]:`Invalid payment configuration`,[F.INVALID_RECIPIENT]:`Invalid recipient address`,[F.INVALID_ASSET]:`Invalid asset specified`,[F.INVALID_AMOUNT]:`Invalid payment amount`,[F.INVALID_RECIPIENT_ADDRESS_FOR_ASSET]:`Invalid recipient address for the asset selected`,[F.UNKNOWN_ERROR]:`Unknown payment error occurred`,[F.UNABLE_TO_INITIATE_PAYMENT]:`Unable to initiate payment`,[F.INVALID_CHAIN_NAMESPACE]:`Invalid chain namespace`,[F.GENERIC_PAYMENT_ERROR]:`Unable to process payment`,[F.UNABLE_TO_GET_EXCHANGES]:`Unable to get exchanges`,[F.ASSET_NOT_SUPPORTED]:`Asset not supported by the selected exchange`,[F.UNABLE_TO_GET_PAY_URL]:`Unable to get payment URL`,[F.UNABLE_TO_GET_BUY_STATUS]:`Unable to get buy status`,[F.UNABLE_TO_GET_TOKEN_BALANCES]:`Unable to get token balances`,[F.UNABLE_TO_GET_QUOTE]:`Unable to get quote. Please choose a different token`,[F.UNABLE_TO_GET_QUOTE_STATUS]:`Unable to get quote status`},L=class e extends Error{get message(){return I[this.code]}constructor(t,n){super(I[t]),this.name=`AppKitPayError`,this.code=t,this.details=n,Error.captureStackTrace&&Error.captureStackTrace(this,e)}},rt=`https://rpc.walletconnect.org/v1/json-rpc`,it=`reown_test`;function at(){let{chainNamespace:e}=i.parseCaipNetworkId(z.state.paymentAsset.network);if(!s.isAddress(z.state.recipient,e))throw new L(F.INVALID_RECIPIENT_ADDRESS_FOR_ASSET,`Provide valid recipient address for namespace "${e}"`)}async function ot(e,t,n){if(t!==l.CHAIN.EVM)throw new L(F.INVALID_CHAIN_NAMESPACE);if(!n.fromAddress)throw new L(F.INVALID_PAYMENT_CONFIG,`fromAddress is required for native EVM payments.`);let r=typeof n.amount==`string`?parseFloat(n.amount):n.amount;if(isNaN(r))throw new L(F.INVALID_PAYMENT_CONFIG);let i=e.metadata?.decimals??18,a=p.parseUnits(r.toString(),i);if(typeof a!=`bigint`)throw new L(F.GENERIC_PAYMENT_ERROR);return await p.sendTransaction({chainNamespace:t,to:n.recipient,address:n.fromAddress,value:a,data:`0x`})??void 0}async function st(e,t){if(!t.fromAddress)throw new L(F.INVALID_PAYMENT_CONFIG,`fromAddress is required for ERC20 EVM payments.`);let n=e.asset,r=t.recipient,i=Number(e.metadata.decimals),o=p.parseUnits(t.amount.toString(),i);if(o===void 0)throw new L(F.GENERIC_PAYMENT_ERROR);return await p.writeContract({fromAddress:t.fromAddress,tokenAddress:n,args:[r,o],method:`transfer`,abi:a.getERC20Abi(n),chainNamespace:l.CHAIN.EVM})??void 0}async function ct(e,t){if(e!==l.CHAIN.SOLANA)throw new L(F.INVALID_CHAIN_NAMESPACE);if(!t.fromAddress)throw new L(F.INVALID_PAYMENT_CONFIG,`fromAddress is required for Solana payments.`);let n=typeof t.amount==`string`?parseFloat(t.amount):t.amount;if(isNaN(n)||n<=0)throw new L(F.INVALID_PAYMENT_CONFIG,`Invalid payment amount.`);try{if(!le.getProvider(e))throw new L(F.GENERIC_PAYMENT_ERROR,`No Solana provider available.`);let r=await p.sendTransaction({chainNamespace:l.CHAIN.SOLANA,to:t.recipient,value:n,tokenMint:t.tokenMint});if(!r)throw new L(F.GENERIC_PAYMENT_ERROR,`Transaction failed.`);return r}catch(e){throw e instanceof L?e:new L(F.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${e}`)}}async function lt({sourceToken:e,toToken:t,amount:n,recipient:r}){let i=p.parseUnits(n,e.metadata.decimals),a=p.parseUnits(n,t.metadata.decimals);return Promise.resolve({type:Ft,origin:{amount:i?.toString()??`0`,currency:e},destination:{amount:a?.toString()??`0`,currency:t},fees:[{id:`service`,label:`Service Fee`,amount:`0`,currency:t}],steps:[{requestId:Ft,type:`deposit`,deposit:{amount:i?.toString()??`0`,currency:e.asset,receiver:r}}],timeInSeconds:6})}function ut(e){if(!e)return null;let t=e.steps[0];return!t||t.type!==`deposit`?null:t}function dt(e,t=0){if(!e)return[];let n=e.steps.filter(e=>e.type===It),r=n.filter((e,n)=>n+1>t);return n.length>0&&n.length<3?r:[]}var ft=new oe({baseUrl:s.getApiUrl(),clientId:null}),pt=class extends Error{};function mt(){return`${rt}?projectId=${e.getSnapshot().projectId}`}function ht(){let{projectId:t,sdkType:n,sdkVersion:r}=e.state;return{projectId:t,st:n||`appkit`,sv:r||`html-wagmi-4.2.2`}}async function gt(t,n){let r=mt(),{sdkType:i,sdkVersion:a,projectId:o}=e.getSnapshot(),s={jsonrpc:`2.0`,id:1,method:t,params:{...n||{},st:i,sv:a,projectId:o}},c=await(await fetch(r,{method:`POST`,body:JSON.stringify(s),headers:{"Content-Type":`application/json`}})).json();if(c.error)throw new pt(c.error.message);return c}async function _t(e){return(await gt(`reown_getExchanges`,e)).result}async function vt(e){return(await gt(`reown_getExchangePayUrl`,e)).result}async function yt(e){return(await gt(`reown_getExchangeBuyStatus`,e)).result}async function bt(e){let t=m.bigNumber(e.amount).times(10**e.toToken.metadata.decimals).toString(),{chainId:n,chainNamespace:r}=i.parseCaipNetworkId(e.sourceToken.network),{chainId:a,chainNamespace:o}=i.parseCaipNetworkId(e.toToken.network),s=e.sourceToken.asset===`native`?ue(r):e.sourceToken.asset,c=e.toToken.asset===`native`?ue(o):e.toToken.asset;return await ft.post({path:`/appkit/v1/transfers/quote`,body:{user:e.address,originChainId:n.toString(),originCurrency:s,destinationChainId:a.toString(),destinationCurrency:c,recipient:e.recipient,amount:t},params:ht()})}async function xt(e){let t=x.isLowerCaseMatch(e.sourceToken.network,e.toToken.network),n=x.isLowerCaseMatch(e.sourceToken.asset,e.toToken.asset);return t&&n?lt(e):bt(e)}async function St(e){return await ft.get({path:`/appkit/v1/transfers/status`,params:{requestId:e.requestId,...ht()}})}async function Ct(e){return await ft.get({path:`/appkit/v1/transfers/assets/exchanges/${e}`,params:ht()})}var wt=[`eip155`,`solana`],Tt={eip155:{native:{assetNamespace:`slip44`,assetReference:`60`},defaultTokenNamespace:`erc20`},solana:{native:{assetNamespace:`slip44`,assetReference:`501`},defaultTokenNamespace:`token`}},Et={56:`714`,204:`714`};function Dt(e,t){let{chainNamespace:n,chainId:r}=i.parseCaipNetworkId(e),a=Tt[n];if(!a)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${n}`);let o=a.native.assetNamespace,s=a.native.assetReference;return t===`native`?n===`eip155`&&Et[r]&&(s=Et[r]):(o=a.defaultTokenNamespace,s=t),`${`${n}:${r}`}/${o}:${s}`}function Ot(e){let{chainNamespace:t}=i.parseCaipNetworkId(e);return wt.includes(t)}function kt(e){let t=h.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.chainId),n=e.address;if(!t)throw Error(`Target network not found for balance chainId "${e.chainId}"`);if(x.isLowerCaseMatch(e.symbol,t.nativeCurrency.symbol))n=`native`;else if(s.isCaipAddress(n)){let{address:e}=i.parseCaipAddress(n);n=e}else if(!n)throw Error(`Balance address not found for balance symbol "${e.symbol}"`);return{network:t.caipNetworkId,asset:n,metadata:{name:e.name,symbol:e.symbol,decimals:Number(e.quantity.decimals),logoURI:e.iconUrl},amount:e.quantity.numeric}}function At(e){return{chainId:e.network,address:`${e.network}:${e.asset}`,symbol:e.metadata.symbol,name:e.metadata.name,iconUrl:e.metadata.logoURI||``,price:0,quantity:{numeric:`0`,decimals:e.metadata.decimals.toString()}}}function jt(e){let t=m.bigNumber(e,{safe:!0});return t.lt(.001)?`<0.001`:t.round(4).toString()}function Mt(e){let t=h.getAllRequestedCaipNetworks().find(t=>t.caipNetworkId===e.network);return t?!!t.testnet:!1}var Nt=0,Pt=`unknown`,Ft=`direct-transfer`,It=`transaction`,R=ee({paymentAsset:{network:`eip155:1`,asset:`0x0`,metadata:{name:`0x0`,symbol:`0x0`,decimals:0}},recipient:`0x0`,amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0,choice:`pay`,tokenBalances:{[l.CHAIN.EVM]:[],[l.CHAIN.SOLANA]:[]},isFetchingTokenBalances:!1,selectedPaymentAsset:null,quote:void 0,quoteStatus:`waiting`,quoteError:null,isFetchingQuote:!1,selectedExchange:void 0,exchangeUrlForQuote:void 0,requestId:void 0}),z={state:R,subscribe(e){return pe(R,()=>e(R))},subscribeKey(e,t){return o(R,e,t)},async handleOpenPay(e){this.resetState(),this.setPaymentConfig(e),this.initializeAnalytics(),at(),await this.prepareTokenLogo(),R.isConfigured=!0,_.sendEvent({type:`track`,event:`PAY_MODAL_OPEN`,properties:{exchanges:R.exchanges,configuration:{network:R.paymentAsset.network,asset:R.paymentAsset.asset,recipient:R.recipient,amount:R.amount}}}),await u.open({view:`Pay`})},resetState(){R.paymentAsset={network:`eip155:1`,asset:`0x0`,metadata:{name:`0x0`,symbol:`0x0`,decimals:0}},R.recipient=`0x0`,R.amount=0,R.isConfigured=!1,R.error=null,R.isPaymentInProgress=!1,R.isLoading=!1,R.currentPayment=void 0,R.selectedExchange=void 0,R.exchangeUrlForQuote=void 0,R.requestId=void 0},resetQuoteState(){R.quote=void 0,R.quoteStatus=`waiting`,R.quoteError=null,R.isFetchingQuote=!1,R.requestId=void 0},setPaymentConfig(e){if(!e.paymentAsset)throw new L(F.INVALID_PAYMENT_CONFIG);try{R.choice=e.choice??`pay`,R.paymentAsset=e.paymentAsset,R.recipient=e.recipient,R.amount=e.amount,R.openInNewTab=e.openInNewTab??!0,R.redirectUrl=e.redirectUrl,R.payWithExchange=e.payWithExchange,R.error=null}catch(e){throw new L(F.INVALID_PAYMENT_CONFIG,e.message)}},setSelectedPaymentAsset(e){R.selectedPaymentAsset=e},setSelectedExchange(e){R.selectedExchange=e},setRequestId(e){R.requestId=e},setPaymentInProgress(e){R.isPaymentInProgress=e},getPaymentAsset(){return R.paymentAsset},getExchanges(){return R.exchanges},async fetchExchanges(){try{R.isLoading=!0,R.exchanges=(await _t({page:Nt})).exchanges.slice(0,2)}catch{throw g.showError(I.UNABLE_TO_GET_EXCHANGES),new L(F.UNABLE_TO_GET_EXCHANGES)}finally{R.isLoading=!1}},async getAvailableExchanges(e){try{let t=e?.asset&&e?.network?Dt(e.network,e.asset):void 0;return await _t({page:e?.page??Nt,asset:t,amount:e?.amount?.toString()})}catch{throw new L(F.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(e,t,n=!1){try{let r=Number(t.amount),i=await vt({exchangeId:e,asset:Dt(t.network,t.asset),amount:r.toString(),recipient:`${t.network}:${t.recipient}`});return _.sendEvent({type:`track`,event:`PAY_EXCHANGE_SELECTED`,properties:{source:`pay`,exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:`exchange`,exchangeId:e},headless:n}}),n&&(this.initiatePayment(),_.sendEvent({type:`track`,event:`PAY_INITIATED`,properties:{source:`pay`,paymentId:R.paymentId||Pt,configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:`exchange`,exchangeId:e}}})),i}catch(e){throw e instanceof Error&&e.message.includes(`is not supported`)?new L(F.ASSET_NOT_SUPPORTED):Error(e.message)}},async generateExchangeUrlForQuote({exchangeId:e,paymentAsset:t,amount:n,recipient:r}){let i=await vt({exchangeId:e,asset:Dt(t.network,t.asset),amount:n.toString(),recipient:r});R.exchangeSessionId=i.sessionId,R.exchangeUrlForQuote=i.url},async openPayUrl(e,t,n=!1){try{let r=await this.getPayUrl(e.exchangeId,t,n);if(!r)throw new L(F.UNABLE_TO_GET_PAY_URL);let i=e.openInNewTab??!0?`_blank`:`_self`;return s.openHref(r.url,i),r}catch(e){throw R.error=e instanceof L?e.message:I.GENERIC_PAYMENT_ERROR,new L(F.UNABLE_TO_GET_PAY_URL)}},async onTransfer({chainNamespace:e,fromAddress:t,toAddress:n,amount:r,paymentAsset:i}){if(R.currentPayment={type:`wallet`,status:`IN_PROGRESS`},!R.isPaymentInProgress)try{this.initiatePayment();let a=h.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===i.network);if(!a)throw Error(`Target network not found`);let o=h.state.activeCaipNetwork;switch(x.isLowerCaseMatch(o?.caipNetworkId,a.caipNetworkId)||await h.switchActiveNetwork(a),e){case l.CHAIN.EVM:i.asset===`native`&&(R.currentPayment.result=await ot(i,e,{recipient:n,amount:r,fromAddress:t})),i.asset.startsWith(`0x`)&&(R.currentPayment.result=await st(i,{recipient:n,amount:r,fromAddress:t})),R.currentPayment.status=`SUCCESS`;break;case l.CHAIN.SOLANA:R.currentPayment.result=await ct(e,{recipient:n,amount:r,fromAddress:t,tokenMint:i.asset===`native`?void 0:i.asset}),R.currentPayment.status=`SUCCESS`;break;default:throw new L(F.INVALID_CHAIN_NAMESPACE)}}catch(e){throw R.error=e instanceof L?e.message:I.GENERIC_PAYMENT_ERROR,R.currentPayment.status=`FAILED`,g.showError(R.error),e}finally{R.isPaymentInProgress=!1}},async onSendTransaction(e){try{let{namespace:t,transactionStep:n}=e;z.initiatePayment();let r=h.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===R.paymentAsset?.network);if(!r)throw Error(`Target network not found`);let i=h.state.activeCaipNetwork;if(x.isLowerCaseMatch(i?.caipNetworkId,r.caipNetworkId)||await h.switchActiveNetwork(r),t===l.CHAIN.EVM){let{from:e,to:r,data:i,value:a}=n.transaction;await p.sendTransaction({address:e,to:r,data:i,value:BigInt(a),chainNamespace:t})}else if(t===l.CHAIN.SOLANA){let{instructions:e}=n.transaction;await p.writeSolanaTransaction({instructions:e})}}catch(e){throw R.error=e instanceof L?e.message:I.GENERIC_PAYMENT_ERROR,g.showError(R.error),e}finally{R.isPaymentInProgress=!1}},getExchangeById(e){return R.exchanges.find(t=>t.id===e)},validatePayConfig(e){let{paymentAsset:t,recipient:n,amount:r}=e;if(!t)throw new L(F.INVALID_PAYMENT_CONFIG);if(!n)throw new L(F.INVALID_RECIPIENT);if(!t.asset)throw new L(F.INVALID_ASSET);if(r==null||r<=0)throw new L(F.INVALID_AMOUNT)},async handlePayWithExchange(e){try{R.currentPayment={type:`exchange`,exchangeId:e};let{network:t,asset:n}=R.paymentAsset,r={network:t,asset:n,amount:R.amount,recipient:R.recipient},i=await this.getPayUrl(e,r);if(!i)throw new L(F.UNABLE_TO_INITIATE_PAYMENT);return R.currentPayment.sessionId=i.sessionId,R.currentPayment.status=`IN_PROGRESS`,R.currentPayment.exchangeId=e,this.initiatePayment(),{url:i.url,openInNewTab:R.openInNewTab}}catch(e){return R.error=e instanceof L?e.message:I.GENERIC_PAYMENT_ERROR,R.isPaymentInProgress=!1,g.showError(R.error),null}},async getBuyStatus(e,t){try{let n=await yt({sessionId:t,exchangeId:e});return(n.status===`SUCCESS`||n.status===`FAILED`)&&_.sendEvent({type:`track`,event:n.status===`SUCCESS`?`PAY_SUCCESS`:`PAY_ERROR`,properties:{message:n.status===`FAILED`?s.parseError(R.error):void 0,source:`pay`,paymentId:R.paymentId||Pt,configuration:{network:R.paymentAsset.network,asset:R.paymentAsset.asset,recipient:R.recipient,amount:R.amount},currentPayment:{type:`exchange`,exchangeId:R.currentPayment?.exchangeId,sessionId:R.currentPayment?.sessionId,result:n.txHash}}}),n}catch{throw new L(F.UNABLE_TO_GET_BUY_STATUS)}},async fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:n}){if(!e)return[];let{address:r}=i.parseCaipAddress(e),a=t;return n===l.CHAIN.EVM&&(a=void 0),await re.getMyTokensWithBalance({address:r,caipNetwork:a})},async fetchTokensFromExchange(){if(!R.selectedExchange)return[];let e=await Ct(R.selectedExchange.id),t=Object.values(e.assets).flat();return await Promise.all(t.map(async e=>{let t=At(e),{chainNamespace:n}=i.parseCaipNetworkId(t.chainId),a=t.address;if(s.isCaipAddress(a)){let{address:e}=i.parseCaipAddress(a);a=e}return t.iconUrl=await r.getImageByToken(a??``,n).catch(()=>void 0)??``,t}))},async fetchTokens({caipAddress:e,caipNetwork:t,namespace:n}){try{R.isFetchingTokenBalances=!0;let r=await(R.selectedExchange?this.fetchTokensFromExchange():this.fetchTokensFromEOA({caipAddress:e,caipNetwork:t,namespace:n}));R.tokenBalances={...R.tokenBalances,[n]:r}}catch(e){let t=e instanceof Error?e.message:`Unable to get token balances`;g.showError(t)}finally{R.isFetchingTokenBalances=!1}},async fetchQuote({amount:e,address:t,sourceToken:n,toToken:r,recipient:i}){try{z.resetQuoteState(),R.isFetchingQuote=!0;let a=await xt({amount:e,address:R.selectedExchange?void 0:t,sourceToken:n,toToken:r,recipient:i});if(R.selectedExchange){let e=ut(a);if(e){let t=`${n.network}:${e.deposit.receiver}`,r=m.formatNumber(e.deposit.amount,{decimals:n.metadata.decimals??0,round:8});await z.generateExchangeUrlForQuote({exchangeId:R.selectedExchange.id,paymentAsset:n,amount:r.toString(),recipient:t})}}R.quote=a}catch(e){let t=I.UNABLE_TO_GET_QUOTE;if(e instanceof Error&&e.cause&&e.cause instanceof Response)try{let n=await e.cause.json();n.error&&typeof n.error==`string`&&(t=n.error)}catch{}throw R.quoteError=t,g.showError(t),new L(F.UNABLE_TO_GET_QUOTE)}finally{R.isFetchingQuote=!1}},async fetchQuoteStatus({requestId:e}){try{if(e===`direct-transfer`){let e=R.selectedExchange,t=R.exchangeSessionId;if(e&&t){switch((await this.getBuyStatus(e.id,t)).status){case`IN_PROGRESS`:R.quoteStatus=`waiting`;break;case`SUCCESS`:R.quoteStatus=`success`,R.isPaymentInProgress=!1;break;case`FAILED`:R.quoteStatus=`failure`,R.isPaymentInProgress=!1;break;case`UNKNOWN`:R.quoteStatus=`waiting`;break;default:R.quoteStatus=`waiting`}return}R.quoteStatus=`success`;return}let{status:t}=await St({requestId:e});R.quoteStatus=t}catch{throw R.quoteStatus=`failure`,new L(F.UNABLE_TO_GET_QUOTE_STATUS)}},initiatePayment(){R.isPaymentInProgress=!0,R.paymentId=crypto.randomUUID()},initializeAnalytics(){R.analyticsSet||(R.analyticsSet=!0,this.subscribeKey(`isPaymentInProgress`,e=>{if(R.currentPayment?.status&&R.currentPayment.status!==`UNKNOWN`){let e={IN_PROGRESS:`PAY_INITIATED`,SUCCESS:`PAY_SUCCESS`,FAILED:`PAY_ERROR`}[R.currentPayment.status];_.sendEvent({type:`track`,event:e,properties:{message:R.currentPayment.status===`FAILED`?s.parseError(R.error):void 0,source:`pay`,paymentId:R.paymentId||Pt,configuration:{network:R.paymentAsset.network,asset:R.paymentAsset.asset,recipient:R.recipient,amount:R.amount},currentPayment:{type:R.currentPayment.type,exchangeId:R.currentPayment.exchangeId,sessionId:R.currentPayment.sessionId,result:R.currentPayment.result}}})}}))},async prepareTokenLogo(){if(!R.paymentAsset.metadata.logoURI)try{let{chainNamespace:e}=i.parseCaipNetworkId(R.paymentAsset.network),t=await r.getImageByToken(R.paymentAsset.asset,e);R.paymentAsset.metadata.logoURI=t}catch{}}},Lt=y`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 40px;
    height: 40px;
  }

  .chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[8]};
    border-top-left-radius: ${({borderRadius:e})=>e[8]};
  }
`,Rt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},B=class extends S{constructor(){super(),this.unsubscribe=[],this.amount=z.state.amount,this.namespace=void 0,this.paymentAsset=z.state.paymentAsset,this.activeConnectorIds=f.state.activeConnectorIds,this.caipAddress=void 0,this.exchanges=z.state.exchanges,this.isLoading=z.state.isLoading,this.initializeNamespace(),this.unsubscribe.push(z.subscribeKey(`amount`,e=>this.amount=e)),this.unsubscribe.push(f.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e)),this.unsubscribe.push(z.subscribeKey(`exchanges`,e=>this.exchanges=e)),this.unsubscribe.push(z.subscribeKey(`isLoading`,e=>this.isLoading=e)),z.fetchExchanges(),z.setSelectedExchange(void 0)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `}paymentMethodsTemplate(){return b`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `}initializeNamespace(){let e=h.state.activeChain;this.namespace=e,this.caipAddress=h.getAccountData(e)?.caipAddress,this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress},e))}paymentDetailsTemplate(){let e=h.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return b`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${[`6`,`8`,`6`,`8`]}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${jt(this.amount||`0`)}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol||`Unknown`}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${e?.name||`Unknown`}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${w(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${w(r.getNetworkImage(e))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `}payWithWalletTemplate(){return Ot(this.paymentAsset.network)?this.caipAddress?this.connectedWalletTemplate():this.disconnectedWalletTemplate():b``}connectedWalletTemplate(){let{name:e,image:t}=this.getWalletProperties({namespace:this.namespace});return b`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${!1}
          ?chevron=${!0}
          ?fullSize=${!1}
          ?rounded=${!0}
          data-testid="wallet-payment-option"
          imageSrc=${w(t)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${!1}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `}disconnectedWalletTemplate(){return b`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`}templateExchangeOptions(){if(this.isLoading)return b`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`;let e=this.exchanges.filter(e=>Mt(this.paymentAsset)?e.id===it:e.id!==it);return e.length===0?b`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:e.map(e=>b`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${()=>this.onExchangePayment(e)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          imageSrc=${w(e.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${e.name}
          </wui-text>
        </wui-list-item>
      `)}templateSeparator(){return b`<wui-separator text="or" bgColor="secondary"></wui-separator>`}async onWalletPayment(){if(!this.namespace)throw Error(`Namespace not found`);this.caipAddress?d.push(`PayQuote`):(await f.connect(),await u.open({view:`PayQuote`}))}onExchangePayment(e){z.setSelectedExchange(e),d.push(`PayQuote`)}async onDisconnect(){try{await p.disconnect(),await u.open({view:`Pay`})}catch{console.error(`Failed to disconnect`),g.showError(`Failed to disconnect`)}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=f.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let i=r.getConnectorImage(n);return{name:n.name,image:i}}};B.styles=Lt,Rt([C()],B.prototype,`amount`,void 0),Rt([C()],B.prototype,`namespace`,void 0),Rt([C()],B.prototype,`paymentAsset`,void 0),Rt([C()],B.prototype,`activeConnectorIds`,void 0),Rt([C()],B.prototype,`caipAddress`,void 0),Rt([C()],B.prototype,`exchanges`,void 0),Rt([C()],B.prototype,`isLoading`,void 0),B=Rt([T(`w3m-pay-view`)],B);var zt=y`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-container {
    position: relative;
    width: var(--pulse-size);
    height: var(--pulse-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--pulse-color);
    opacity: 0;
    animation: pulse var(--pulse-duration, 2s) ease-out infinite;
  }

  .pulse-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: var(--pulse-opacity, 0.3);
    }
    50% {
      opacity: calc(var(--pulse-opacity, 0.3) * 0.5);
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`,Bt=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Vt=3,Ht=2,Ut=.3,Wt=`200px`,Gt={"accent-primary":ge.tokens.core.backgroundAccentPrimary},Kt=class extends S{constructor(){super(...arguments),this.rings=Vt,this.duration=Ht,this.opacity=Ut,this.size=Wt,this.variant=`accent-primary`}render(){let e=Gt[this.variant];this.style.cssText=`
      --pulse-size: ${this.size};
      --pulse-duration: ${this.duration}s;
      --pulse-color: ${e};
      --pulse-opacity: ${this.opacity};
    `;let t=Array.from({length:this.rings},(e,t)=>this.renderRing(t,this.rings));return b`
      <div class="pulse-container">
        <div class="pulse-rings">${t}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `}renderRing(e,t){let n=`animation-delay: ${e/t*this.duration}s;`;return b`<div class="pulse-ring" style=${n}></div>`}};Kt.styles=[v,zt],Bt([E({type:Number})],Kt.prototype,`rings`,void 0),Bt([E({type:Number})],Kt.prototype,`duration`,void 0),Bt([E({type:Number})],Kt.prototype,`opacity`,void 0),Bt([E()],Kt.prototype,`size`,void 0),Bt([E()],Kt.prototype,`variant`,void 0),Kt=Bt([T(`wui-pulse`)],Kt);var qt=[{id:`received`,title:`Receiving funds`,icon:`dollar`},{id:`processing`,title:`Swapping asset`,icon:`recycleHorizontal`},{id:`sending`,title:`Sending asset to the recipient address`,icon:`send`}],Jt=[`success`,`submitted`,`failure`,`timeout`,`refund`],Yt=y`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({borderRadius:e})=>e[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 3px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({colors:e})=>e.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[6]};
    border-top-left-radius: ${({borderRadius:e})=>e[6]};
  }

  .payment-step-badge {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e.round};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }
`,V=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Xt={received:[`pending`,`success`,`submitted`],processing:[`success`,`submitted`],sending:[`success`,`submitted`]},Zt=3e3,H=class extends S{constructor(){super(),this.unsubscribe=[],this.pollingInterval=null,this.paymentAsset=z.state.paymentAsset,this.quoteStatus=z.state.quoteStatus,this.quote=z.state.quote,this.amount=z.state.amount,this.namespace=void 0,this.caipAddress=void 0,this.profileName=null,this.activeConnectorIds=f.state.activeConnectorIds,this.selectedExchange=z.state.selectedExchange,this.initializeNamespace(),this.unsubscribe.push(z.subscribeKey(`quoteStatus`,e=>this.quoteStatus=e),z.subscribeKey(`quote`,e=>this.quote=e),f.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e),z.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e))}connectedCallback(){super.connectedCallback(),this.startPolling()}disconnectedCallback(){super.disconnectedCallback(),this.stopPolling(),this.unsubscribe.forEach(e=>e())}render(){return b`
      <wui-flex flexDirection="column" .padding=${[`3`,`0`,`0`,`0`]} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `}tokenTemplate(){let e=jt(this.amount||`0`),t=this.paymentAsset.metadata.symbol??`Unknown`,n=h.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network),i=this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`;return this.quoteStatus===`success`||this.quoteStatus===`submitted`?b`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:i?b`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:b`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${w(r.getNetworkImage(n))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${e} ${t}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}paymentTemplate(){return b`
      <wui-flex flexDirection="column" gap="2" .padding=${[`0`,`6`,`0`,`6`]}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `}paymentLifecycleTemplate(){let e=this.getStepsWithStatus();return b`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${[`2`,`0`,`2`,`0`]}>
          ${e.map(e=>this.renderStep(e))}
        </wui-flex>
      </wui-flex>
    `}renderPaymentCycleBadge(){let e=this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`,t=this.quoteStatus===`success`||this.quoteStatus===`submitted`;if(e)return b`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `;if(t)return b`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `;let n=this.quote?.timeInSeconds??0;return b`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${n} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `}renderPayment(){let e=h.getAllRequestedCaipNetworks().find(e=>{let t=this.quote?.origin.currency.network;if(!t)return!1;let{chainId:n}=i.parseCaipNetworkId(t);return x.isLowerCaseMatch(e.id.toString(),n.toString())}),t=jt(m.formatNumber(this.quote?.origin.amount||`0`,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString()),n=this.quote?.origin.currency.metadata.symbol??`Unknown`;return b`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${[`3`,`0`,`3`,`0`]}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${t}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${n}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${w(r.getNetworkImage(e))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${e?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderWallet(){return b`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${[`3`,`0`,`3`,`0`]}
      >
        <wui-text variant="lg-regular" color="secondary"
          >${this.selectedExchange?`Exchange`:`Wallet`}</wui-text
        >

        ${this.renderWalletText()}
      </wui-flex>
    `}renderWalletText(){let{image:e}=this.getWalletProperties({namespace:this.namespace}),{address:t}=this.caipAddress?i.parseCaipAddress(this.caipAddress):{},n=this.selectedExchange?.name;return this.selectedExchange?b`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${n}</wui-text>
          <wui-image src=${w(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `:b`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${ye.getTruncateString({string:this.profileName||t||n||``,charsStart:this.profileName?16:4,charsEnd:this.profileName?0:6,truncate:this.profileName?`end`:`middle`})}
        </wui-text>

        <wui-image src=${w(e)} size="mdl"></wui-image>
      </wui-flex>
    `}getStepsWithStatus(){return this.quoteStatus===`failure`||this.quoteStatus===`timeout`||this.quoteStatus===`refund`?qt.map(e=>({...e,status:`failed`})):qt.map(e=>{let t=(Xt[e.id]??[]).includes(this.quoteStatus)?`completed`:`pending`;return{...e,status:t}})}renderStep({title:e,icon:t,status:n}){return b`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${t} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${be({"step-icon-box":!0,success:n===`completed`})}>
            ${this.renderStatusIndicator(n)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${e}</wui-text>
      </wui-flex>
    `}renderStatusIndicator(e){return e===`completed`?b`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`:e===`failed`?b`<wui-icon size="sm" color="error" name="close"></wui-icon>`:e===`pending`?b`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`:null}startPolling(){this.pollingInterval||=(this.fetchQuoteStatus(),setInterval(()=>{this.fetchQuoteStatus()},Zt))}stopPolling(){this.pollingInterval&&=(clearInterval(this.pollingInterval),null)}async fetchQuoteStatus(){let e=z.state.requestId;if(!e||Jt.includes(this.quoteStatus))this.stopPolling();else try{await z.fetchQuoteStatus({requestId:e}),Jt.includes(this.quoteStatus)&&this.stopPolling()}catch{this.stopPolling()}}initializeNamespace(){let e=h.state.activeChain;this.namespace=e,this.caipAddress=h.getAccountData(e)?.caipAddress,this.profileName=h.getAccountData(e)?.profileName??null,this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null},e))}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=f.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let i=r.getConnectorImage(n);return{name:n.name,image:i}}};H.styles=Yt,V([C()],H.prototype,`paymentAsset`,void 0),V([C()],H.prototype,`quoteStatus`,void 0),V([C()],H.prototype,`quote`,void 0),V([C()],H.prototype,`amount`,void 0),V([C()],H.prototype,`namespace`,void 0),V([C()],H.prototype,`caipAddress`,void 0),V([C()],H.prototype,`profileName`,void 0),V([C()],H.prototype,`activeConnectorIds`,void 0),V([C()],H.prototype,`selectedExchange`,void 0),H=V([T(`w3m-pay-loading-view`)],H);var Qt=y`
  button {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    column-gap: ${({spacing:e})=>e[1]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: background-color;
  }

  wui-image,
  .icon-box {
    width: ${({spacing:e})=>e[6]};
    height: ${({spacing:e})=>e[6]};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    flex: 1;
  }

  .icon-box {
    position: relative;
  }

  .icon-box[data-active='true'] {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .circle {
    position: absolute;
    left: 16px;
    top: 15px;
    width: 8px;
    height: 8px;
    background-color: ${({tokens:e})=>e.core.textSuccess};
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: 50%;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,U=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},W=class extends S{constructor(){super(...arguments),this.address=``,this.profileName=``,this.alt=``,this.imageSrc=``,this.icon=void 0,this.iconSize=`md`,this.enableGreenCircle=!0,this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return b`
      <button>
        ${this.leftImageTemplate()} ${this.textTemplate()} ${this.rightImageTemplate()}
      </button>
    `}leftImageTemplate(){let e=this.icon?b`<wui-icon
          size=${w(this.iconSize)}
          color="default"
          name=${this.icon}
          class="icon"
        ></wui-icon>`:b`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`;return b`
      <wui-flex
        alignItems="center"
        justifyContent="center"
        class="icon-box"
        data-active=${!!this.icon}
      >
        ${e}
        ${this.enableGreenCircle?b`<wui-flex class="circle"></wui-flex>`:null}
      </wui-flex>
    `}textTemplate(){return b`
      <wui-text variant="lg-regular" color="primary">
        ${ye.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?`end`:`middle`})}
      </wui-text>
    `}rightImageTemplate(){return b`<wui-icon name="chevronBottom" size="sm" color="default"></wui-icon>`}};W.styles=[v,_e,Qt],U([E()],W.prototype,`address`,void 0),U([E()],W.prototype,`profileName`,void 0),U([E()],W.prototype,`alt`,void 0),U([E()],W.prototype,`imageSrc`,void 0),U([E()],W.prototype,`icon`,void 0),U([E()],W.prototype,`iconSize`,void 0),U([E({type:Boolean})],W.prototype,`enableGreenCircle`,void 0),U([E({type:Boolean})],W.prototype,`loading`,void 0),U([E({type:Number})],W.prototype,`charsStart`,void 0),U([E({type:Number})],W.prototype,`charsEnd`,void 0),W=U([T(`wui-wallet-switch`)],W);var $t=ve`
  :host {
    display: block;
  }
`,en=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},tn=class extends S{render(){return b`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-shimmer width="60px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-shimmer
              width="75px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>

            <wui-flex alignItems="center" gap="01">
              <wui-shimmer width="14px" height="14px" rounded variant="light"></wui-shimmer>
              <wui-shimmer
                width="49px"
                height="14px"
                borderRadius="4xs"
                variant="light"
              ></wui-shimmer>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-shimmer width="75px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};tn.styles=[$t],tn=en([T(`w3m-pay-fees-skeleton`)],tn);var nn=y`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }
`,rn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},an=class extends S{constructor(){super(),this.unsubscribe=[],this.quote=z.state.quote,this.unsubscribe.push(z.subscribeKey(`quote`,e=>this.quote=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=m.formatNumber(this.quote?.origin.amount||`0`,{decimals:this.quote?.origin.currency.metadata.decimals??0,round:6}).toString();return b`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${e} ${this.quote?.origin.currency.metadata.symbol||`Unknown`}
          </wui-text>
        </wui-flex>

        ${this.quote&&this.quote.fees.length>0?this.quote.fees.map(e=>this.renderFee(e)):null}
      </wui-flex>
    `}renderFee(e){let t=e.id===`network`,n=m.formatNumber(e.amount||`0`,{decimals:e.currency.metadata.decimals??0,round:6}).toString();if(t){let t=h.getAllRequestedCaipNetworks().find(t=>x.isLowerCaseMatch(t.caipNetworkId,e.currency.network));return b`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${n} ${e.currency.metadata.symbol||`Unknown`}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${w(r.getNetworkImage(t))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${t?.name||`Unknown`}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `}return b`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${e.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${n} ${e.currency.metadata.symbol||`Unknown`}
        </wui-text>
      </wui-flex>
    `}};an.styles=[nn],rn([C()],an.prototype,`quote`,void 0),an=rn([T(`w3m-pay-fees`)],an);var on=y`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({spacing:e})=>e[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({spacing:e})=>e[8]};
    height: ${({spacing:e})=>e[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`,sn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},cn=class extends S{constructor(){super(),this.unsubscribe=[],this.selectedExchange=z.state.selectedExchange,this.unsubscribe.push(z.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=!!this.selectedExchange;return b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${e?null:b`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `}dispatchConnectOtherWalletEvent(){this.dispatchEvent(new CustomEvent(`connectOtherWallet`,{detail:!0,bubbles:!0,composed:!0}))}};cn.styles=[on],sn([E({type:Array})],cn.prototype,`selectedExchange`,void 0),cn=sn([T(`w3m-pay-options-empty`)],cn);var ln=y`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    min-height: 60px;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    bottom: -3px;
    right: -5px;
    border: 2px solid ${({tokens:e})=>e.theme.foregroundSecondary};
  }
`,un=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},dn=class extends S{render(){return b`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.renderOptionEntry()} ${this.renderOptionEntry()} ${this.renderOptionEntry()}
      </wui-flex>
    `}renderOptionEntry(){return b`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-shimmer
              width="32px"
              height="32px"
              rounded
              variant="light"
              class="token-image"
            ></wui-shimmer>
            <wui-shimmer
              width="16px"
              height="16px"
              rounded
              variant="light"
              class="chain-image"
            ></wui-shimmer>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-shimmer
              width="74px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
            <wui-shimmer
              width="46px"
              height="14px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}};dn.styles=[ln],dn=un([T(`w3m-pay-options-skeleton`)],dn);var fn=y`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    mask-image: var(--options-mask-image);
    -webkit-mask-image: var(--options-mask-image);
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    cursor: pointer;
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius:e})=>e.round};
    width: 32px;
    height: 32px;
  }

  .chain-image {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
  }

  @media (hover: hover) and (pointer: fine) {
    .pay-option-container:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,pn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},mn=300,hn=class extends S{constructor(){super(),this.unsubscribe=[],this.options=[],this.selectedPaymentAsset=null}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect(),(this.shadowRoot?.querySelector(`.pay-options-container`))?.removeEventListener(`scroll`,this.handleOptionsListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(`.pay-options-container`);e&&(requestAnimationFrame(this.handleOptionsListScroll.bind(this)),e?.addEventListener(`scroll`,this.handleOptionsListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleOptionsListScroll()}),this.resizeObserver?.observe(e),this.handleOptionsListScroll())}render(){return b`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(e=>this.payOptionTemplate(e))}
      </wui-flex>
    `}payOptionTemplate(e){let{network:t,metadata:n,asset:i,amount:a=`0`}=e,o=h.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===t),s=`${t}:${i}`==`${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`,c=m.bigNumber(a,{safe:!0}),ee=c.gt(0);return b`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${()=>this.onSelect?.(e)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${w(n.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${w(r.getNetworkImage(o))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${n.symbol}</wui-text>
            ${ee?b`<wui-text variant="sm-regular" color="secondary">
                  ${c.round(6).toString()} ${n.symbol}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>

        ${s?b`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`:null}
      </wui-flex>
    `}handleOptionsListScroll(){let e=this.shadowRoot?.querySelector(`.pay-options-container`);e&&(e.scrollHeight>mn?(e.style.setProperty(`--options-mask-image`,`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,
          black 50px,
          black calc(100% - 50px),
          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty(`--options-scroll--top-opacity`,Oe.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty(`--options-scroll--bottom-opacity`,Oe.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty(`--options-mask-image`,`none`),e.style.setProperty(`--options-scroll--top-opacity`,`0`),e.style.setProperty(`--options-scroll--bottom-opacity`,`0`)))}};hn.styles=[fn],pn([E({type:Array})],hn.prototype,`options`,void 0),pn([E()],hn.prototype,`selectedPaymentAsset`,void 0),pn([E()],hn.prototype,`onSelect`,void 0),hn=pn([T(`w3m-pay-options`)],hn);var gn=y`
  .payment-methods-container {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius:e})=>e[5]};
    border-top-left-radius: ${({borderRadius:e})=>e[5]};
  }

  .pay-options-container {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding: ${({spacing:e})=>e[1]};
  }

  w3m-tooltip-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: fit-content;
  }

  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  w3m-pay-options.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`,G=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},_n={eip155:`ethereum`,solana:`solana`,bip122:`bitcoin`,ton:`ton`},vn={eip155:{icon:_n.eip155,label:`EVM`},solana:{icon:_n.solana,label:`Solana`},bip122:{icon:_n.bip122,label:`Bitcoin`},ton:{icon:_n.ton,label:`Ton`}},K=class extends S{constructor(){super(),this.unsubscribe=[],this.profileName=null,this.paymentAsset=z.state.paymentAsset,this.namespace=void 0,this.caipAddress=void 0,this.amount=z.state.amount,this.recipient=z.state.recipient,this.activeConnectorIds=f.state.activeConnectorIds,this.selectedPaymentAsset=z.state.selectedPaymentAsset,this.selectedExchange=z.state.selectedExchange,this.isFetchingQuote=z.state.isFetchingQuote,this.quoteError=z.state.quoteError,this.quote=z.state.quote,this.isFetchingTokenBalances=z.state.isFetchingTokenBalances,this.tokenBalances=z.state.tokenBalances,this.isPaymentInProgress=z.state.isPaymentInProgress,this.exchangeUrlForQuote=z.state.exchangeUrlForQuote,this.completedTransactionsCount=0,this.unsubscribe.push(z.subscribeKey(`paymentAsset`,e=>this.paymentAsset=e)),this.unsubscribe.push(z.subscribeKey(`tokenBalances`,e=>this.onTokenBalancesChanged(e))),this.unsubscribe.push(z.subscribeKey(`isFetchingTokenBalances`,e=>this.isFetchingTokenBalances=e)),this.unsubscribe.push(f.subscribeKey(`activeConnectorIds`,e=>this.activeConnectorIds=e)),this.unsubscribe.push(z.subscribeKey(`selectedPaymentAsset`,e=>this.selectedPaymentAsset=e)),this.unsubscribe.push(z.subscribeKey(`isFetchingQuote`,e=>this.isFetchingQuote=e)),this.unsubscribe.push(z.subscribeKey(`quoteError`,e=>this.quoteError=e)),this.unsubscribe.push(z.subscribeKey(`quote`,e=>this.quote=e)),this.unsubscribe.push(z.subscribeKey(`amount`,e=>this.amount=e)),this.unsubscribe.push(z.subscribeKey(`recipient`,e=>this.recipient=e)),this.unsubscribe.push(z.subscribeKey(`isPaymentInProgress`,e=>this.isPaymentInProgress=e)),this.unsubscribe.push(z.subscribeKey(`selectedExchange`,e=>this.selectedExchange=e)),this.unsubscribe.push(z.subscribeKey(`exchangeUrlForQuote`,e=>this.exchangeUrlForQuote=e)),this.resetQuoteState(),this.initializeNamespace(),this.fetchTokens()}disconnectedCallback(){super.disconnectedCallback(),this.resetAssetsState(),this.unsubscribe.forEach(e=>e())}updated(e){super.updated(e),e.has(`selectedPaymentAsset`)&&this.fetchQuote()}render(){return b`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${[`4`,`4`,`5`,`4`]}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${[`1`,`0`,`1`,`0`]}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `}profileTemplate(){if(this.selectedExchange){let e=m.formatNumber(this.quote?.origin.amount,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return b`
        <wui-flex
          .padding=${[`4`,`3`,`4`,`3`]}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote?b`<wui-text variant="lg-regular" color="primary">
                ${m.bigNumber(e,{safe:!0}).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`:b`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `}let e=s.getPlainAddress(this.caipAddress)??``,{name:t,image:n}=this.getWalletProperties({namespace:this.namespace}),{icon:r,label:i}=vn[this.namespace]??{};return b`
      <wui-flex
        .padding=${[`4`,`3`,`4`,`3`]}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${w(this.profileName)}
          address=${w(e)}
          imageSrc=${w(n)}
          alt=${w(t)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${w(i)}
          address=${w(e)}
          icon=${w(r)}
          iconSize="xs"
          .enableGreenCircle=${!1}
          alt=${w(i)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `}initializeNamespace(){let e=h.state.activeChain;this.namespace=e,this.caipAddress=h.getAccountData(e)?.caipAddress,this.profileName=h.getAccountData(e)?.profileName??null,this.unsubscribe.push(h.subscribeChainProp(`accountState`,e=>this.onAccountStateChanged(e),e))}async fetchTokens(){if(this.namespace){let e;if(this.caipAddress){let{chainId:t,chainNamespace:n}=i.parseCaipAddress(this.caipAddress),r=`${n}:${t}`;e=h.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===r)}await z.fetchTokens({caipAddress:this.caipAddress,caipNetwork:e,namespace:this.namespace})}}fetchQuote(){if(this.amount&&this.recipient&&this.selectedPaymentAsset&&this.paymentAsset){let{address:e}=this.caipAddress?i.parseCaipAddress(this.caipAddress):{};z.fetchQuote({amount:this.amount.toString(),address:e,sourceToken:this.selectedPaymentAsset,toToken:this.paymentAsset,recipient:this.recipient})}}getWalletProperties({namespace:e}){if(!e)return{name:void 0,image:void 0};let t=this.activeConnectorIds[e];if(!t)return{name:void 0,image:void 0};let n=f.getConnector({id:t,namespace:e});if(!n)return{name:void 0,image:void 0};let i=r.getConnectorImage(n);return{name:n.name,image:i}}paymentOptionsViewTemplate(){return b`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `}paymentOptionsTemplate(){let e=this.getPaymentAssetFromTokenBalances();if(this.isFetchingTokenBalances)return b`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`;if(e.length===0)return b`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`;let t={disabled:this.isFetchingQuote};return b`<w3m-pay-options
      class=${be(t)}
      .options=${e}
      .selectedPaymentAsset=${w(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`}amountWithFeeTemplate(){return this.isFetchingQuote||!this.selectedPaymentAsset||this.quoteError?b`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`:b`<w3m-pay-fees></w3m-pay-fees>`}paymentActionsTemplate(){let e=this.isFetchingQuote||this.isFetchingTokenBalances,t=this.isFetchingQuote||this.isFetchingTokenBalances||!this.selectedPaymentAsset||!!this.quoteError,n=m.formatNumber(this.quote?.origin.amount??0,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return this.selectedExchange?e||t?b`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${!0}></wui-shimmer>
        `:b`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`:b`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${e||t?b`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`:b`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${jt(n)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol||`Unknown`}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({isLoading:e,isDisabled:t})}
      </wui-flex>
    `}actionButtonTemplate(e){let t=dt(this.quote),{isLoading:n,isDisabled:r}=e,i=`Pay`;return t.length>1&&this.completedTransactionsCount===0&&(i=`Approve`),b`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${n||this.isPaymentInProgress}
        ?disabled=${r||this.isPaymentInProgress}
        @click=${()=>{t.length>0?this.onSendTransactions():this.onTransfer()}}
      >
        ${i}
        ${n?null:b`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `}getPaymentAssetFromTokenBalances(){return this.namespace?(this.tokenBalances[this.namespace]??[]).map(e=>{try{return kt(e)}catch{return null}}).filter(e=>!!e).filter(e=>{let{chainId:t}=i.parseCaipNetworkId(e.network),{chainId:n}=i.parseCaipNetworkId(this.paymentAsset.network);return x.isLowerCaseMatch(e.asset,this.paymentAsset.asset)?!0:!this.selectedExchange||!x.isLowerCaseMatch(t.toString(),n.toString())}):[]}onTokenBalancesChanged(e){this.tokenBalances=e;let[t]=this.getPaymentAssetFromTokenBalances();t&&z.setSelectedPaymentAsset(t)}async onConnectOtherWallet(){await f.connect(),await u.open({view:`PayQuote`})}onAccountStateChanged(e){let{address:t}=this.caipAddress?i.parseCaipAddress(this.caipAddress):{};if(this.caipAddress=e?.caipAddress,this.profileName=e?.profileName??null,t){let{address:e}=this.caipAddress?i.parseCaipAddress(this.caipAddress):{};e?x.isLowerCaseMatch(e,t)||(this.resetAssetsState(),this.resetQuoteState(),this.fetchTokens()):u.close()}}onSelectedPaymentAssetChanged(e){this.isFetchingQuote||z.setSelectedPaymentAsset(e)}async onTransfer(){let e=ut(this.quote);if(e){if(!x.isLowerCaseMatch(this.selectedPaymentAsset?.asset,e.deposit.currency))throw Error(`Quote asset is not the same as the selected payment asset`);let t=this.selectedPaymentAsset?.amount??`0`,n=m.formatNumber(e.deposit.amount,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!m.bigNumber(t).gte(n)){g.showError(`Insufficient funds`);return}if(this.quote&&this.selectedPaymentAsset&&this.caipAddress&&this.namespace){let{address:t}=i.parseCaipAddress(this.caipAddress);await z.onTransfer({chainNamespace:this.namespace,fromAddress:t,toAddress:e.deposit.receiver,amount:n,paymentAsset:this.selectedPaymentAsset}),z.setRequestId(e.requestId),d.push(`PayLoading`)}}}async onSendTransactions(){let e=this.selectedPaymentAsset?.amount??`0`,t=m.formatNumber(this.quote?.origin.amount??0,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!m.bigNumber(e).gte(t)){g.showError(`Insufficient funds`);return}let n=dt(this.quote),[r]=dt(this.quote,this.completedTransactionsCount);r&&this.namespace&&(await z.onSendTransaction({namespace:this.namespace,transactionStep:r}),this.completedTransactionsCount+=1,this.completedTransactionsCount===n.length&&(z.setRequestId(r.requestId),d.push(`PayLoading`)))}onPayWithExchange(){if(this.exchangeUrlForQuote){let e=s.returnOpenHref(``,`popupWindow`,`scrollbar=yes,width=480,height=720`);if(!e)throw Error(`Could not create popup window`);e.location.href=this.exchangeUrlForQuote;let t=ut(this.quote);t&&z.setRequestId(t.requestId),z.initiatePayment(),d.push(`PayLoading`)}}resetAssetsState(){z.setSelectedPaymentAsset(null)}resetQuoteState(){z.resetQuoteState()}};K.styles=gn,G([C()],K.prototype,`profileName`,void 0),G([C()],K.prototype,`paymentAsset`,void 0),G([C()],K.prototype,`namespace`,void 0),G([C()],K.prototype,`caipAddress`,void 0),G([C()],K.prototype,`amount`,void 0),G([C()],K.prototype,`recipient`,void 0),G([C()],K.prototype,`activeConnectorIds`,void 0),G([C()],K.prototype,`selectedPaymentAsset`,void 0),G([C()],K.prototype,`selectedExchange`,void 0),G([C()],K.prototype,`isFetchingQuote`,void 0),G([C()],K.prototype,`quoteError`,void 0),G([C()],K.prototype,`quote`,void 0),G([C()],K.prototype,`isFetchingTokenBalances`,void 0),G([C()],K.prototype,`tokenBalances`,void 0),G([C()],K.prototype,`isPaymentInProgress`,void 0),G([C()],K.prototype,`exchangeUrlForQuote`,void 0),G([C()],K.prototype,`completedTransactionsCount`,void 0),K=G([T(`w3m-pay-quote-view`)],K);var yn=y`
  wui-image {
    border-radius: ${({borderRadius:e})=>e.round};
  }

  .transfers-badge {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }
`,bn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},xn=class extends S{constructor(){super(),this.unsubscribe=[],this.paymentAsset=z.state.paymentAsset,this.amount=z.state.amount,this.unsubscribe.push(z.subscribeKey(`paymentAsset`,e=>{this.paymentAsset=e}),z.subscribeKey(`amount`,e=>{this.amount=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=h.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.paymentAsset.network);return b`<wui-flex
      alignItems="center"
      gap="1"
      .padding=${[`1`,`2`,`1`,`1`]}
      class="transfers-badge"
    >
      <wui-image src=${w(this.paymentAsset.metadata.logoURI)} size="xl"></wui-image>
      <wui-text variant="lg-regular" color="primary">
        ${this.amount} ${this.paymentAsset.metadata.symbol}
      </wui-text>
      <wui-text variant="sm-regular" color="secondary">
        on ${e?.name??`Unknown`}
      </wui-text>
    </wui-flex>`}};xn.styles=[yn],bn([E()],xn.prototype,`paymentAsset`,void 0),bn([E()],xn.prototype,`amount`,void 0),xn=bn([T(`w3m-pay-header`)],xn);var Sn=y`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]},
      slide-down-in 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]},
      slide-up-in 120ms forwards ${({easings:e})=>e[`ease-out-power-2`]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`,Cn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},wn=[`SmartSessionList`],Tn={PayWithExchange:ge.tokens.theme.foregroundPrimary};function En(){let e=d.state.data?.connector?.name,t=d.state.data?.wallet?.name,n=d.state.data?.network?.name,r=t??e,i=f.getConnectors(),a=i.length===1&&i[0]?.id===`w3m-email`,o=h.getAccountData()?.socialProvider,s=o?o.charAt(0).toUpperCase()+o.slice(1):`Connect Social`;return{Connect:`Connect ${a?`Email`:``} Wallet`,Create:`Create Wallet`,ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:`All Wallets`,ApproveTransaction:`Approve Transaction`,BuyInProgress:`Buy`,UsageExceeded:`Usage Exceeded`,ConnectingExternal:r??`Connect Wallet`,ConnectingWalletConnect:r??`WalletConnect`,ConnectingWalletConnectBasic:`WalletConnect`,ConnectingSiwe:`Sign In`,Convert:`Convert`,ConvertSelectToken:`Select token`,ConvertPreview:`Preview Convert`,Downloads:r?`Get ${r}`:`Downloads`,EmailLogin:`Email Login`,EmailVerifyOtp:`Confirm Email`,EmailVerifyDevice:`Register Device`,GetWallet:`Get a Wallet`,Networks:`Choose Network`,OnRampProviders:`Choose Provider`,OnRampActivity:`Activity`,OnRampTokenSelect:`Select Token`,OnRampFiatSelect:`Select Currency`,Pay:`How you pay`,ProfileWallets:`Wallets`,SwitchNetwork:n??`Switch Network`,Transactions:`Activity`,UnsupportedChain:`Switch Network`,UpgradeEmailWallet:`Upgrade Your Wallet`,UpdateEmailWallet:`Edit Email`,UpdateEmailPrimaryOtp:`Confirm Current Email`,UpdateEmailSecondaryOtp:`Confirm New Email`,WhatIsABuy:`What is Buy?`,RegisterAccountName:`Choose Name`,RegisterAccountNameSuccess:``,WalletReceive:`Receive`,WalletCompatibleNetworks:`Compatible Networks`,Swap:`Swap`,SwapSelectToken:`Select Token`,SwapPreview:`Preview Swap`,WalletSend:`Send`,WalletSendPreview:`Review Send`,WalletSendSelectToken:`Select Token`,WalletSendConfirmed:`Confirmed`,WhatIsANetwork:`What is a network?`,WhatIsAWallet:`What is a Wallet?`,ConnectWallets:`Connect Wallet`,ConnectSocials:`All Socials`,ConnectingSocial:s,ConnectingMultiChain:`Select Chain`,ConnectingFarcaster:`Farcaster`,SwitchActiveChain:`Switch Chain`,SmartSessionCreated:void 0,SmartSessionList:`Smart Sessions`,SIWXSignMessage:`Sign In`,PayLoading:`Processing payment...`,PayQuote:`Payment Quote`,DataCapture:`Profile`,DataCaptureOtpConfirm:`Confirm Email`,FundWallet:`Fund Wallet`,PayWithExchange:`Deposit from Exchange`,PayWithExchangeSelectAsset:`Select Asset`,SmartAccountSettings:`Smart Account Settings`}}var q=class extends S{constructor(){super(),this.unsubscribe=[],this.heading=En()[d.state.view],this.network=h.state.activeCaipNetwork,this.networkImage=r.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=d.state.view,this.viewDirection=``,this.unsubscribe.push(n.subscribeNetworkImages(()=>{this.networkImage=r.getNetworkImage(this.network)}),d.subscribeKey(`view`,e=>{setTimeout(()=>{this.view=e,this.heading=En()[e]},qe.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),h.subscribeKey(`activeCaipNetwork`,e=>{this.network=e,this.networkImage=r.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=Tn[d.state.view]??ge.tokens.theme.backgroundPrimary;return this.style.setProperty(`--local-header-background-color`,e),b`
      <wui-flex
        .padding=${[`0`,`4`,`0`,`4`]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){_.sendEvent({type:`track`,event:`CLICK_WALLET_HELP`}),d.push(`WhatIsAWallet`)}async onClose(){await De.safeClose()}rightHeaderTemplate(){let t=e?.state?.features?.smartSessions;return d.state.view!==`Account`||!t?this.closeButtonTemplate():b`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>d.push(`SmartSessionList`)}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `}closeButtonTemplate(){return b`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){if(this.view===`PayQuote`)return b`<w3m-pay-header></w3m-pay-header>`;let e=wn.includes(this.view);return b`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${e?b`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){let{view:t}=d.state,n=t===`Connect`,r=e.state.enableEmbedded,i=t===`ApproveTransaction`,a=t===`ConnectingSiwe`,o=t===`Account`,s=e.state.enableNetworkSwitch,c=i||a||n&&r;return o&&s?b`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${w(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${w(this.networkImage)}
      ></wui-select>`:this.showBack&&!c?b`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:b`<wui-icon-button
      data-hidden=${!n}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(_.sendEvent({type:`track`,event:`CLICK_NETWORKS`}),d.push(`Networks`))}isAllowedNetworkSwitch(){let e=h.getAllRequestedCaipNetworks(),t=e?e.length>1:!1,n=e?.find(({id:e})=>e===this.network?.id);return t||!n}onViewChange(){let{history:e}=d.state,t=qe.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=qe.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){let{history:e}=d.state,t=this.shadowRoot?.querySelector(`#dynamic`);e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:`forwards`,easing:`ease`}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:`forwards`,easing:`ease`}))}onGoBack(){d.goBack()}};q.styles=Sn,Cn([C()],q.prototype,`heading`,void 0),Cn([C()],q.prototype,`network`,void 0),Cn([C()],q.prototype,`networkImage`,void 0),Cn([C()],q.prototype,`showBack`,void 0),Cn([C()],q.prototype,`prevHistoryLength`,void 0),Cn([C()],q.prototype,`view`,void 0),Cn([C()],q.prototype,`viewDirection`,void 0),q=Cn([T(`w3m-header`)],q);var Dn=y`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[2]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:e})=>e.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    border-radius: ${({borderRadius:e})=>e.round} !important;
  }
`,On=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},kn=class extends S{constructor(){super(...arguments),this.message=``,this.variant=`success`}render(){return b`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return this.variant===`loading`?b`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:b`<wui-icon-box
      size="md"
      color=${{success:`success`,error:`error`,warning:`warning`,info:`default`}[this.variant]}
      icon=${{success:`checkmark`,error:`warning`,warning:`warningCircle`,info:`info`}[this.variant]}
    ></wui-icon-box>`}};kn.styles=[v,Dn],On([E()],kn.prototype,`message`,void 0),On([E()],kn.prototype,`variant`,void 0),kn=On([T(`wui-snackbar`)],kn);var An=ve`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`,jn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Mn=class extends S{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=g.state.open,this.unsubscribe.push(g.subscribeKey(`open`,e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=g.state;return b` <wui-snackbar message=${e} variant=${t}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:`translateX(-50%) scale(0.85)`},{opacity:1,transform:`translateX(-50%) scale(1)`}],{duration:150,fill:`forwards`,easing:`ease`}),this.timeout&&clearTimeout(this.timeout),g.state.autoClose&&(this.timeout=setTimeout(()=>g.hide(),2500))):this.animate([{opacity:1,transform:`translateX(-50%) scale(1)`},{opacity:0,transform:`translateX(-50%) scale(0.85)`}],{duration:150,fill:`forwards`,easing:`ease`})}};Mn.styles=An,jn([C()],Mn.prototype,`open`,void 0),Mn=jn([T(`w3m-snackbar`)],Mn);var Nn=ve`
  :host {
    width: 100%;
    display: block;
  }
`,Pn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Fn=class extends S{constructor(){super(),this.unsubscribe=[],this.text=``,this.open=j.state.open,this.unsubscribe.push(d.subscribeKey(`view`,()=>{j.hide()}),u.subscribeKey(`open`,e=>{e||j.hide()}),j.subscribeKey(`open`,e=>{this.open=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),j.hide()}render(){return b`
      <div
        @pointermove=${this.onMouseEnter.bind(this)}
        @pointerleave=${this.onMouseLeave.bind(this)}
      >
        ${this.renderChildren()}
      </div>
    `}renderChildren(){return b`<slot></slot> `}onMouseEnter(){let e=this.getBoundingClientRect();if(!this.open){let t=document.querySelector(`w3m-modal`),n={width:e.width,height:e.height,left:e.left,top:e.top};if(t){let r=t.getBoundingClientRect();n.left=e.left-(window.innerWidth-r.width)/2,n.top=e.top-(window.innerHeight-r.height)/2}j.showTooltip({message:this.text,triggerRect:n,variant:`shade`})}}onMouseLeave(e){this.contains(e.relatedTarget)||j.hide()}};Fn.styles=[Nn],Pn([E()],Fn.prototype,`text`,void 0),Pn([C()],Fn.prototype,`open`,void 0),Fn=Pn([T(`w3m-tooltip-trigger`)],Fn);var In=y`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:e})=>e[3]} 10px ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:e})=>e[5]});
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,Ln=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Rn=class extends S{constructor(){super(),this.unsubscribe=[],this.open=j.state.open,this.message=j.state.message,this.triggerRect=j.state.triggerRect,this.variant=j.state.variant,this.unsubscribe.push(j.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;let e=this.triggerRect.top,t=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${e}px;
    --w3m-tooltip-left: ${t}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?`flex`:`none`};
    --w3m-tooltip-opacity: ${+!!this.open};
    `,b`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};Rn.styles=[In],Ln([C()],Rn.prototype,`open`,void 0),Ln([C()],Rn.prototype,`message`,void 0),Ln([C()],Rn.prototype,`triggerRect`,void 0),Ln([C()],Rn.prototype,`variant`,void 0),Rn=Ln([T(`w3m-tooltip`)],Rn);var zn={getTabsByNamespace(t){return t&&t===l.CHAIN.EVM?e.state.remoteFeatures?.activity===!1?qe.ACCOUNT_TABS.filter(e=>e.label!==`Activity`):qe.ACCOUNT_TABS:[]},isValidReownName(e){return/^[a-zA-Z0-9]+$/gu.test(e)},isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(e)},validateReownName(e){return e.replace(/\^/gu,``).toLowerCase().replace(/[^a-zA-Z0-9]/gu,``)},hasFooter(){let t=d.state.view;if(qe.VIEWS_WITH_LEGAL_FOOTER.includes(t)){let{termsConditionsUrl:t,privacyPolicyUrl:n}=e.state,r=e.state.features?.legalCheckbox;return!(!t&&!n||r)}return qe.VIEWS_WITH_DEFAULT_FOOTER.includes(t)}},Bn=y`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:e})=>e[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.core.textAccentPrimary};
    font-weight: 500;
  }
`,Vn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Hn=class extends S{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=e.state.remoteFeatures,this.unsubscribe.push(e.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:t,privacyPolicyUrl:n}=e.state,r=e.state.features?.legalCheckbox;return!t&&!n||r?b`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:b`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${[`4`,`3`,`3`,`3`]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){let{termsConditionsUrl:t,privacyPolicyUrl:n}=e.state;return t&&n?`and`:``}termsTemplate(){let{termsConditionsUrl:t}=e.state;return t?b`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){let{privacyPolicyUrl:t}=e.state;return t?b`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(e=!1){return this.remoteFeatures?.reownBranding?e?b`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:b`<wui-ux-by-reown></wui-ux-by-reown>`:null}};Hn.styles=[Bn],Vn([C()],Hn.prototype,`remoteFeatures`,void 0),Hn=Vn([T(`w3m-legal-footer`)],Hn);var Un=ve``,Wn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Gn=class extends S{render(){let{termsConditionsUrl:t,privacyPolicyUrl:n}=e.state;return!t&&!n?null:b`
      <wui-flex
        .padding=${[`4`,`3`,`3`,`3`]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `}howDoesItWorkTemplate(){return b` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){_.sendEvent({type:`track`,event:`SELECT_WHAT_IS_A_BUY`,properties:{isSmartAccount:ce(h.state.activeChain)===te.ACCOUNT_TYPES.SMART_ACCOUNT}}),d.push(`WhatIsABuy`)}};Gn.styles=[Un],Gn=Wn([T(`w3m-onramp-providers-footer`)],Gn);var Kn=y`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`,qn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Jn=class extends S{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status=`hide`,this.view=d.state.view}firstUpdated(){this.status=zn.hasFooter()?`show`:`hide`,this.unsubscribe.push(d.subscribeKey(`view`,e=>{this.view=e,this.status=zn.hasFooter()?`show`:`hide`,this.status===`hide`&&document.documentElement.style.setProperty(`--apkt-footer-height`,`0px`)})),this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=`${t.contentRect.height}px`;document.documentElement.style.setProperty(`--apkt-footer-height`,e)}}),this.resizeObserver.observe(this.getWrapper())}render(){return b`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return zn.hasFooter()?b` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case`Networks`:return this.templateNetworksFooter();case`Connect`:case`ConnectWallets`:case`OnRampFiatSelect`:case`OnRampTokenSelect`:return b`<w3m-legal-footer></w3m-legal-footer>`;case`OnRampProviders`:return b`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return b` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){_.sendEvent({type:`track`,event:`CLICK_NETWORK_HELP`}),d.push(`WhatIsANetwork`)}getWrapper(){return this.shadowRoot?.querySelector(`div.container`)}};Jn.styles=[Kn],qn([C()],Jn.prototype,`status`,void 0),qn([C()],Jn.prototype,`view`,void 0),Jn=qn([T(`w3m-footer`)],Jn);var Yn=y`
  :host {
    display: block;
    width: inherit;
  }
`,Xn=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Zn=class extends S{constructor(){super(),this.unsubscribe=[],this.viewState=d.state.view,this.history=d.state.history.join(`,`),this.unsubscribe.push(d.subscribeKey(`view`,()=>{this.history=d.state.history.join(`,`),document.documentElement.style.setProperty(`--apkt-duration-dynamic`,`var(--apkt-durations-lg)`)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),document.documentElement.style.setProperty(`--apkt-duration-dynamic`,`0s`)}render(){return b`${this.templatePageContainer()}`}templatePageContainer(){return b`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=d.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(e){switch(e){case`AccountSettings`:return b`<w3m-account-settings-view></w3m-account-settings-view>`;case`Account`:return b`<w3m-account-view></w3m-account-view>`;case`AllWallets`:return b`<w3m-all-wallets-view></w3m-all-wallets-view>`;case`ApproveTransaction`:return b`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case`BuyInProgress`:return b`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case`ChooseAccountName`:return b`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case`Connect`:return b`<w3m-connect-view></w3m-connect-view>`;case`Create`:return b`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case`ConnectingWalletConnect`:return b`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case`ConnectingWalletConnectBasic`:return b`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case`ConnectingExternal`:return b`<w3m-connecting-external-view></w3m-connecting-external-view>`;case`ConnectingSiwe`:return b`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case`ConnectWallets`:return b`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case`ConnectSocials`:return b`<w3m-connect-socials-view></w3m-connect-socials-view>`;case`ConnectingSocial`:return b`<w3m-connecting-social-view></w3m-connecting-social-view>`;case`DataCapture`:return b`<w3m-data-capture-view></w3m-data-capture-view>`;case`DataCaptureOtpConfirm`:return b`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case`Downloads`:return b`<w3m-downloads-view></w3m-downloads-view>`;case`EmailLogin`:return b`<w3m-email-login-view></w3m-email-login-view>`;case`EmailVerifyOtp`:return b`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case`EmailVerifyDevice`:return b`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case`GetWallet`:return b`<w3m-get-wallet-view></w3m-get-wallet-view>`;case`Networks`:return b`<w3m-networks-view></w3m-networks-view>`;case`SwitchNetwork`:return b`<w3m-network-switch-view></w3m-network-switch-view>`;case`ProfileWallets`:return b`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case`Transactions`:return b`<w3m-transactions-view></w3m-transactions-view>`;case`OnRampProviders`:return b`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case`OnRampTokenSelect`:return b`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case`OnRampFiatSelect`:return b`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case`UpgradeEmailWallet`:return b`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case`UpdateEmailWallet`:return b`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case`UpdateEmailPrimaryOtp`:return b`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case`UpdateEmailSecondaryOtp`:return b`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case`UnsupportedChain`:return b`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case`Swap`:return b`<w3m-swap-view></w3m-swap-view>`;case`SwapSelectToken`:return b`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case`SwapPreview`:return b`<w3m-swap-preview-view></w3m-swap-preview-view>`;case`WalletSend`:return b`<w3m-wallet-send-view></w3m-wallet-send-view>`;case`WalletSendSelectToken`:return b`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case`WalletSendPreview`:return b`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case`WalletSendConfirmed`:return b`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case`WhatIsABuy`:return b`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case`WalletReceive`:return b`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case`WalletCompatibleNetworks`:return b`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case`WhatIsAWallet`:return b`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case`ConnectingMultiChain`:return b`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case`WhatIsANetwork`:return b`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case`ConnectingFarcaster`:return b`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case`SwitchActiveChain`:return b`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case`RegisterAccountName`:return b`<w3m-register-account-name-view></w3m-register-account-name-view>`;case`RegisterAccountNameSuccess`:return b`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case`SmartSessionCreated`:return b`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case`SmartSessionList`:return b`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case`SIWXSignMessage`:return b`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case`Pay`:return b`<w3m-pay-view></w3m-pay-view>`;case`PayLoading`:return b`<w3m-pay-loading-view></w3m-pay-loading-view>`;case`PayQuote`:return b`<w3m-pay-quote-view></w3m-pay-quote-view>`;case`FundWallet`:return b`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case`PayWithExchange`:return b`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case`PayWithExchangeSelectAsset`:return b`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;case`UsageExceeded`:return b`<w3m-usage-exceeded-view></w3m-usage-exceeded-view>`;case`SmartAccountSettings`:return b`<w3m-smart-account-settings-view></w3m-smart-account-settings-view>`;default:return b`<w3m-connect-view></w3m-connect-view>`}}};Zn.styles=[Yn],Xn([C()],Zn.prototype,`viewState`,void 0),Xn([C()],Zn.prototype,`history`,void 0),Zn=Xn([T(`w3m-router`)],Zn);var Qn=y`
  :host {
    z-index: ${({tokens:e})=>e.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:e})=>e.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      backdrop-filter ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-2`]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-2`]};
    transition-delay: ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:e})=>e[`ease-out-power-2`]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e[`ease-out-power-2`]},
      w3m-shake ${({durations:e})=>e.xl}
        ${({easings:e})=>e[`ease-out-power-2`]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:e})=>e[`ease-out-power-2`]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
  }
`,J=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$n=`scroll-lock`,er={PayWithExchange:`0`,PayWithExchangeSelectAsset:`0`,Pay:`0`,PayQuote:`0`,PayLoading:`0`},Y=class extends S{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=e.state.enableEmbedded,this.open=u.state.open,this.caipAddress=h.state.activeCaipAddress,this.caipNetwork=h.state.activeCaipNetwork,this.shake=u.state.shake,this.filterByNamespace=f.state.filterByNamespace,this.padding=ge.spacing[1],this.mobileFullScreen=e.state.enableMobileFullScreen,this.initializeTheming(),fe.prefetchAnalyticsConfig(),this.unsubscribe.push(u.subscribeKey(`open`,e=>e?this.onOpen():this.onClose()),u.subscribeKey(`shake`,e=>this.shake=e),h.subscribeKey(`activeCaipNetwork`,e=>this.onNewNetwork(e)),h.subscribeKey(`activeCaipAddress`,e=>this.onNewAddress(e)),e.subscribeKey(`enableEmbedded`,e=>this.enableEmbedded=e),f.subscribeKey(`filterByNamespace`,e=>{this.filterByNamespace!==e&&!h.getAccountData(e)?.caipAddress&&(fe.fetchRecommendedWallets(),this.filterByNamespace=e)}),d.subscribeKey(`view`,()=>{this.dataset.border=zn.hasFooter()?`true`:`false`,this.padding=er[d.state.view]??ge.spacing[1]}))}firstUpdated(){if(this.dataset.border=zn.hasFooter()?`true`:`false`,this.mobileFullScreen&&this.setAttribute(`data-mobile-fullscreen`,`true`),this.caipAddress){if(this.enableEmbedded){u.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.setProperty(`--local-modal-padding`,this.padding),this.enableEmbedded?b`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?b`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return b` <wui-card
      shake="${this.shake}"
      data-embedded="${w(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){if(e.target===e.currentTarget){if(this.mobileFullScreen)return;await this.handleClose()}}async handleClose(){await De.safeClose()}initializeTheming(){let{themeVariables:e,themeMode:t}=ae.state,n=ye.getColorTheme(t);he(e,n)}onClose(){this.open=!1,this.classList.remove(`open`),this.onScrollUnlock(),g.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add(`open`),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){let e=document.createElement(`style`);e.dataset.w3m=$n,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){let e=document.head.querySelector(`style[data-w3m="${$n}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;let e=this.shadowRoot?.querySelector(`wui-card`);e?.focus(),window.addEventListener(`keydown`,t=>{if(t.key===`Escape`)this.handleClose();else if(t.key===`Tab`){let{tagName:n}=t.target;n&&!n.includes(`W3M-`)&&!n.includes(`WUI-`)&&e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){let t=h.state.isSwitchingNamespace,n=d.state.view===`ProfileWallets`;!e&&!t&&!n&&u.close(),await Se.initializeIfEnabled(e),this.caipAddress=e,h.setIsSwitchingNamespace(!1)}onNewNetwork(e){let t=this.caipNetwork?.caipNetworkId?.toString()!==e?.caipNetworkId?.toString(),n=d.state.view===`UnsupportedChain`,r=u.state.open,i=!1;this.enableEmbedded&&d.state.view===`SwitchNetwork`&&(i=!0),t&&k.resetState(),r&&n&&(i=!0),i&&d.state.view!==`SIWXSignMessage`&&d.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||=(fe.prefetch(),fe.fetchWalletsByPage({page:1}),!0)}};Y.styles=Qn,J([E({type:Boolean})],Y.prototype,`enableEmbedded`,void 0),J([C()],Y.prototype,`open`,void 0),J([C()],Y.prototype,`caipAddress`,void 0),J([C()],Y.prototype,`caipNetwork`,void 0),J([C()],Y.prototype,`shake`,void 0),J([C()],Y.prototype,`filterByNamespace`,void 0),J([C()],Y.prototype,`padding`,void 0),J([C()],Y.prototype,`mobileFullScreen`,void 0);var tr=class extends Y{};tr=J([T(`w3m-modal`)],tr);var nr=class extends Y{};nr=J([T(`appkit-modal`)],nr);var rr=y`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius:e})=>e[5]};
    background-color: ${({colors:e})=>e.semanticError010};
  }
`,ir=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},ar=class extends S{constructor(){super()}render(){return b`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${[`1`,`3`,`4`,`3`]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){d.goBack()}};ar.styles=rr,ar=ir([T(`w3m-usage-exceeded-view`)],ar);var or=y`
  :host {
    width: 100%;
  }
`,X=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},Z=class extends S{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc=``,this.name=``,this.size=`md`,this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor=`accent-100`,this.rdnsId=``,this.displayIndex=void 0,this.walletRank=void 0,this.namespaces=[]}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has(`name`)||e.has(`imageSrc`)||e.has(`walletRank`))&&(this.hasImpressionSent=!1),e.has(`walletRank`)&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&!this.loading&&!this.hasImpressionSent&&this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&=(this.intersectionObserver.disconnect(),void 0)}sendImpressionEvent(){!this.name||this.hasImpressionSent||!this.walletRank||(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&_.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:d.state.view,displayIndex:this.displayIndex}))}handleGetWalletNamespaces(){return Object.keys(de.state.adapters).length>1?this.namespaces:[]}render(){return b`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${w(this.imageSrc)}
        name=${this.name}
        size=${w(this.size)}
        tagLabel=${w(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
        .namespaces=${this.handleGetWalletNamespaces()}
      ></wui-list-wallet>
    `}};Z.styles=or,X([E({type:Array})],Z.prototype,`walletImages`,void 0),X([E()],Z.prototype,`imageSrc`,void 0),X([E()],Z.prototype,`name`,void 0),X([E()],Z.prototype,`size`,void 0),X([E()],Z.prototype,`tagLabel`,void 0),X([E()],Z.prototype,`tagVariant`,void 0),X([E()],Z.prototype,`walletIcon`,void 0),X([E()],Z.prototype,`tabIdx`,void 0),X([E({type:Boolean})],Z.prototype,`disabled`,void 0),X([E({type:Boolean})],Z.prototype,`showAllWallets`,void 0),X([E({type:Boolean})],Z.prototype,`loading`,void 0),X([E({type:String})],Z.prototype,`loadingSpinnerColor`,void 0),X([E()],Z.prototype,`rdnsId`,void 0),X([E()],Z.prototype,`displayIndex`,void 0),X([E()],Z.prototype,`walletRank`,void 0),X([E({type:Array})],Z.prototype,`namespaces`,void 0),Z=X([T(`w3m-list-wallet`)],Z);var sr=y`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:e})=>e.lg};
    --local-transition: ${({easings:e})=>e[`ease-out-power-2`]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`,Q=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},cr=60,$=class extends S{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration=`0.15s`,this.transitionFunction=``,this.history=``,this.view=``,this.setView=void 0,this.viewDirection=``,this.historyState=``,this.previousHeight=`0px`,this.mobileFullScreen=e.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(e){if(e.has(`history`)){let e=this.history;this.historyState!==``&&this.historyState!==e&&this.onViewChange(e)}e.has(`transitionDuration`)&&this.style.setProperty(`--local-duration`,this.transitionDuration),e.has(`transitionFunction`)&&this.style.setProperty(`--local-transition`,this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty(`--local-transition`,this.transitionFunction),this.style.setProperty(`--local-duration`,this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=t.contentRect.height,n=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--apkt-footer-height`)||`0`);this.mobileFullScreen?(e=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-n,this.style.setProperty(`--local-border-bottom-radius`,`0px`)):(e+=n,this.style.setProperty(`--local-border-bottom-radius`,n?`var(--apkt-borderRadius-5)`:`0px`)),this.style.setProperty(`--local-container-height`,`${e}px`),this.previousHeight!==`0px`&&this.style.setProperty(`--local-duration-height`,this.transitionDuration),this.previousHeight=`${e}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener(`resize`,this.onViewportResize),window.visualViewport?.addEventListener(`resize`,this.onViewportResize)}disconnectedCallback(){let e=this.getWrapper();e&&this.resizeObserver&&this.resizeObserver.unobserve(e),window.removeEventListener(`resize`,this.onViewportResize),window.visualViewport?.removeEventListener(`resize`,this.onViewportResize)}render(){return b`
      <div class="container" data-mobile-fullscreen="${w(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${w(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(e){let t=e.split(`,`).filter(Boolean),n=this.historyState.split(`,`).filter(Boolean),r=n.length,i=t.length,a=t[t.length-1]||``,o=ye.cssDurationToNumber(this.transitionDuration),s=``;i>r?s=`next`:i<r?s=`prev`:i===r&&t[i-1]!==n[r-1]&&(s=`next`),this.viewDirection=`${s}-${a}`,setTimeout(()=>{this.historyState=e,this.setView?.(a)},o),setTimeout(()=>{this.viewDirection=``},o*2)}getWrapper(){return this.shadowRoot?.querySelector(`div.page`)}updateContainerHeight(){let e=this.getWrapper();if(!e)return;let t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--apkt-footer-height`)||`0`),n=0;this.mobileFullScreen?(n=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-t,this.style.setProperty(`--local-border-bottom-radius`,`0px`)):(n=e.getBoundingClientRect().height+t,this.style.setProperty(`--local-border-bottom-radius`,t?`var(--apkt-borderRadius-5)`:`0px`)),this.style.setProperty(`--local-container-height`,`${n}px`),this.previousHeight!==`0px`&&this.style.setProperty(`--local-duration-height`,this.transitionDuration),this.previousHeight=`${n}px`}getHeaderHeight(){return cr}};$.styles=[sr],Q([E({type:String})],$.prototype,`transitionDuration`,void 0),Q([E({type:String})],$.prototype,`transitionFunction`,void 0),Q([E({type:String})],$.prototype,`history`,void 0),Q([E({type:String})],$.prototype,`view`,void 0),Q([E({attribute:!1})],$.prototype,`setView`,void 0),Q([C()],$.prototype,`viewDirection`,void 0),Q([C()],$.prototype,`historyState`,void 0),Q([C()],$.prototype,`previousHeight`,void 0),Q([C()],$.prototype,`mobileFullScreen`,void 0),$=Q([T(`w3m-router-container`)],$);export{nr as AppKitModal,Z as W3mListWallet,tr as W3mModal,Y as W3mModalBase,$ as W3mRouterContainer,ar as W3mUsageExceededView};