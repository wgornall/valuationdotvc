/*!
 * Option valuation code v0.6
 * Copyright 2019 Will Gornall
 */
 
 
 
var companyLoaded = -1;

$(document).ready(function() { 
    $('.footer').scrollToFixed( {
        bottom: 10,
        limit: function() { return $('.footer-marker').offset().top; }
    }); 
});         
    

function loadCoData(attemptToLoad ) {
    var trialCoName = document.getElementById("myInput").value;
    
    if (trialCoName =="") {
        trialCoName = "Blank";
    } 
    
    
    var CompanyIndex = uCompany.indexOf(trialCoName);
    
    
    
    if    (CompanyIndex < 0 || !attemptToLoad) {    
        companyLoaded = 0;
        document.getElementById("DataMissing").style.display = '';
        document.getElementById("DataFound").style.display = 'none';            
        
        document.getElementById("in-InvestmentAmount").value =  "";
        document.getElementById("in-LiquidationMultiple").value =  "";  
        document.getElementById("in-GrowthSinceLastRound").value =  ""; 
            
            
            
            
        document.getElementsByName("in-IPORatchet")[0].checked = true;
        document.getElementById("in-ParticipationCap").value    ="" ;
        document.getElementsByName("in-Participation")[0].checked = true;
        
        document.getElementById("in-PMV").value =  "";
        document.getElementById("in-SharePrice").value =  "";
        document.getElementById("in-CumDiv").value =  "";
        
 
        
        
        document.getElementById("in-OldInv").value =  "";


        document.getElementById("in-Special").value = 0;
        

    } else { 
        companyLoaded = 1;
        document.getElementById("DataFound").style.display = '';
        document.getElementById("DataMissing").style.display = 'none';
        document.getElementById("DataFoundCo").innerHTML = uDisclaimer[CompanyIndex];                
         
        document.getElementById("in-GrowthSinceLastRound").value =  ""; 
        
        
        document.getElementById("in-PMV").value =  uValuation[CompanyIndex]/1000000;
        document.getElementById("in-SharePrice").value =  uSharePrice[CompanyIndex]; 
        
 
        document.getElementById("in-InvestmentAmount").value =  uRdAmount[CompanyIndex]/1000000;
        document.getElementById("in-LiquidationMultiple").value =  uLiqMult[CompanyIndex]; 
        
        document.getElementById("in-OldInv").value =  uTotalInv[CompanyIndex]/1000000-uRdAmount[CompanyIndex]/1000000; 
        document.getElementById("in-CumDiv").value =    uCumDiv[CompanyIndex]*100;
     
        document.getElementById("in-Special").value = uSpecial[CompanyIndex]; 
                    
        if (uIPOratchet[CompanyIndex]>0) {     
            document.getElementsByName("in-IPORatchet")[2].checked = true;        
            document.getElementById("in-IPORatchetLevel").value    =    uIPOratchet[CompanyIndex];            
        } else if (uIPOratchet[CompanyIndex]==="") {          
            document.getElementsByName("in-IPORatchet")[0].checked = true;
            document.getElementById("in-IPORatchetLevel").value    =    "";    
        } else {
            document.getElementsByName("in-IPORatchet")[1].checked = true;        
            document.getElementById("in-IPORatchetLevel").value    =    uIPOratchet[CompanyIndex];        
        }
        
        if (uParticipation[CompanyIndex]>0) {     
        
            if(  uParticipationCap[CompanyIndex] > 0) {
                document.getElementsByName("in-Participation")[3].checked = true;    
                document.getElementById("in-ParticipationCap").value    =uParticipationCap[CompanyIndex] ;
            } else {                                
                document.getElementsByName("in-Participation")[2].checked = true;    
            }
        } else  if (uParticipation[CompanyIndex]==="") {      
            document.getElementsByName("in-Participation")[0].checked = true;
        } else   {      
            document.getElementsByName("in-Participation")[1].checked = true;
        }
    }
    
        document.getElementById('FurtherInfo').style.display='';

        onrefreshloop();
};

function lognormalcdfweight(x1, x2, mean, std) {
  return 0.5 * (1 + erf((Math.log(x1) - mean) / (Math.sqrt(2) * std))) -
         0.5 * (1 + erf((Math.log(x2) - mean) / (Math.sqrt(2) * std)));
}
function IPOprobability(x1) {
    var x = x1*1e6;
   return   Math.max(0,Math.min(1,Math.min(.65*(Math.log(x)-Math.log(32e6))/(Math.log(1e9)-Math.log(32e6)),.65+.2*(Math.log(x)-Math.log(1e9))/(Math.log(1e11)-Math.log(1e9)))));
}

function millionDollarFmt(value,) {
    return value.toLocaleString('en-US', {  style: 'currency', currency: 'USD', maximumFractionDigits : 1, minimumFractionDigits : 1, maximumSignificantDigits : 3 });
}; 
function largeDollarFmt(value,) {
    return value.toLocaleString('en-US', {  style: 'currency', currency: 'USD', maximumFractionDigits : 0,  minimumFractionDigits : 0, maximumSignificantDigits : 3 });
};
function dollarFmt(value,) {
    return value.toLocaleString('en-US', {  style: 'currency', currency: 'USD', maximumFractionDigits : 2, minimumFractionDigits : 2});
}; 
function percentFmt(value,) {
    return value.toLocaleString('en-US', {  style: 'percent', maximumFractionDigits : 0 });
};  
function roundToNearest(value,) { 
     var temp = Math.pow(10,Math.ceil(Math.log(value)/Math.log(10)));     
    return Math.ceil(value*10/temp)/10*temp;
};  



function valueoptions() {  


        document.getElementById("special-discl").style.display = 'none';
        document.getElementById("old-discl").style.display = 'none';
  
    // Load all inputs
    var inPMV =                 1*document.getElementById("in-PMV").value;
    var inShareType=            0*document.getElementsByName("in-ShareType")[0].checked +  
                                1*document.getElementsByName("in-ShareType")[1].checked;
    var inShowStrike=            1*document.getElementsByName("in-ShareType")[2].checked;
    var inNumberOptionsOwned =     1*document.getElementById("in-NumberOptionsOwned").value;  
    var inSharePrice =             1*document.getElementById("in-SharePrice").value;
    
    var inCumDiv =                 1*document.getElementById("in-CumDiv").value; 

    var inGrowthSinceLastRound =1*document.getElementById("in-GrowthSinceLastRound").value; 
    var inOptionStrikePrice =     1*document.getElementById("in-OptionStrikePrice").value;

    var inInvestmentAmount =     1*document.getElementById("in-InvestmentAmount").value;
    var inLiquidationMultiple = 1*document.getElementById("in-LiquidationMultiple").value; 
    var inParticipation=        0*document.getElementsByName("in-Participation")[0].checked + 
                                1*document.getElementsByName("in-Participation")[1].checked  + 
                                2*document.getElementsByName("in-Participation")[2].checked  + 
                                3*document.getElementsByName("in-Participation")[3].checked;    
    var inParticipationCap =     1*document.getElementById("in-ParticipationCap").value; 
    var inBlockIPO =             0*document.getElementsByName("in-BlockIPO")[0].checked + 
                                1*document.getElementsByName("in-BlockIPO")[1].checked + 
                                2*document.getElementsByName("in-BlockIPO")[2].checked;
    var inIPORatchet =             0*document.getElementsByName("in-IPORatchet")[0].checked + 
                                1*document.getElementsByName("in-IPORatchet")[1].checked + 
                                2*document.getElementsByName("in-IPORatchet")[2].checked;
    var inIPORatchetLevel =     1*document.getElementById("in-IPORatchetLevel").value;  
    var inOldInv =                 1*document.getElementById("in-OldInv").value;  
                                
                                 
    var inCustomParameters =    0*document.getElementsByName("in-CustomParameters")[0].checked + 
                                1*document.getElementsByName("in-CustomParameters")[1].checked;
    var inExitTime =             1*document.getElementById("in-ExitTime").value; 
    var inRandomExitTime =         0*document.getElementsByName("in-RandomExitTime")[0].checked + 
                                1*document.getElementsByName("in-RandomExitTime")[1].checked;
    var inVolatility =             1*document.getElementById("in-Volatility").value;
    var inBeta =                  1*document.getElementById("in-Beta").value; 
    var inRiskFreeRate =         1*document.getElementById("in-RiskFreeRate").value;  
    var inMarketRiskPremium =     1*document.getElementById("in-MarketRiskPremium").value; 

    var inSpecial =             1*document.getElementById("in-Special").value; 



    // Process Step 1 inputs
    var PMV = inPMV;
    var SharePrice = inSharePrice;
     
    var FDOwnership = inNumberOptionsOwned/PMV/1e6*SharePrice;  
    
     
     
     
    if ( PMV>0 && FDOwnership>0 && FDOwnership<100 && ( !document.getElementsByName("in-ShareType")[2].checked || inOptionStrikePrice>0 ) ) {
        document.getElementById("Output-data").style.display = '';
        if (window.innerWidth>600 && window.innerHeight > 500 ) {
            document.getElementById('Incomplete-footer').style.display='none';     
            document.getElementById('PC-footer').style.display='';     
            document.getElementById('Phone-footer').style.display='none';
            
        } else {
            document.getElementById('Incomplete-footer').style.display='none';     
            document.getElementById('PC-footer').style.display='none';     
            document.getElementById('Phone-footer').style.display='';
        }    
    } else {
        document.getElementById('Incomplete-footer').style.display='';     
        document.getElementById('PC-footer').style.display='none';     
        document.getElementById('Phone-footer').style.display='none';             
        document.getElementById("Output-data").style.display = 'none';
        document.getElementById('OptionExerciseToday-footer').style.display='none';    

        return;
    }
    if(inShowStrike) {
                document.getElementById('op-explanationfordicePMT').innerHTML='To visualize this, imagine paying '+largeDollarFmt(inNumberOptionsOwned*inOptionStrikePrice)+' today in order to be able to roll a standard six sided dice once...';     
                 document.getElementById('op-PricePaidToday').innerHTML=largeDollarFmt(inOptionStrikePrice*inNumberOptionsOwned);  

                document.getElementById('OptionExerciseToday-footer').style.display='';    

    } else {
            document.getElementById('op-explanationfordicePMT').innerHTML='To visualize this, imagine rolling a standard six sided dice once... ';     

                document.getElementById('OptionExerciseToday-footer').style.display='none';    
    }
     
    
    // Process Step 2 inputs  (EXCEPT OPTION STRIKE, WHICH IS DEFERRED)
    
    var GrowthSinceLastRound = inGrowthSinceLastRound/100; 
    

    
    // Process Step 3 inputs 
    if( inInvestmentAmount > 0 ){
        var InvestmentAmount =    inInvestmentAmount;
    } else{
        var InvestmentAmount = PMV*0.2;
    }   
    if( inLiquidationMultiple > 0 ){
        var LiquidationMultiple =    inLiquidationMultiple;
    } else{
        var LiquidationMultiple = 1;
    } 
    if( inCumDiv > 0 ){
        var CumDiv =    inCumDiv/100;
    } else{
        var CumDiv = 0;
    }   
    if( inParticipation == 3){
        if( inParticipationCap > LiquidationMultiple){
            var ParticipationCap =    inParticipationCap;
        } else {
            var ParticipationCap =    3.5;
        }
    } else if ( inParticipation == 2 ) {
        var ParticipationCap = Infinity;
    } else if ( inParticipation == 1 ) {
        var ParticipationCap = LiquidationMultiple;
    } else {
        var ParticipationCap = LiquidationMultiple;
    }
    
    if( inBlockIPO == 2){
        var BlockIPO =    true;
    } else if( inBlockIPO == 1){
        var BlockIPO =    false;
    }   else {
        var BlockIPO =    false;
    } 
    if( inIPORatchet == 2){ 
        if( document.getElementById("in-IPORatchetLevel").value.length > 0 ){
            var IPORatchetLevel =    inIPORatchetLevel;
        } else{
            var IPORatchetLevel = 1; 
        }   
    } else {
        var IPORatchetLevel =    0; 
    }  
    
    if (!(inOldInv>=0)) { 
        inOldInv = 0;
    }
     
    // Process Step 4 inputs 
    if( inExitTime > 0 && inCustomParameters ==1 ){ 
        var ExitTime =    inExitTime;
    } else{
        var ExitTime = 4;
    }
    if( inCustomParameters ==1 ){ 
        var RandomExitTime = inRandomExitTime>0;
    } else{
        var RandomExitTime = true;
    }
    if( inVolatility > 0 && inCustomParameters ==1 ){ 
        var Volatility =    inVolatility/100;
    } else{
        var Volatility = 0.9;
    }
    if( inBeta > 0 && inCustomParameters ==1 ){ 
        var Beta =    inBeta;
    } else{
        var Beta = 2;
    }
    if( inRiskFreeRate > 0 && inCustomParameters ==1 ){ 
        var RiskFreeRate =    inRiskFreeRate/100;
    } else{
        var RiskFreeRate = 0.02;
    }
    if( inMarketRiskPremium > 0 && inCustomParameters ==1 ){ 
        var MarketRiskPremium =    inMarketRiskPremium/100;
    } else{
        var MarketRiskPremium = 0.05;
    }
     
     
    var nn=50;
     
     // Set special case, if appropriate
     
     
    var Special =     (inSpecial==1) +     IPORatchetLevel + BlockIPO + CumDiv + (LiquidationMultiple>1)  + (InvestmentAmount+ inOldInv > 0.5*PMV)  >0 ;  

    if (Special) {

            document.getElementById("special-discl").style.display = '';
        document.getElementById("old-discl").style.display = 'none';
    } else if (inSpecial>=0.5) {
        document.getElementById("special-discl").style.display = 'none';
        document.getElementById("old-discl").style.display = '';
    } else {
        document.getElementById("special-discl").style.display = 'none';
        document.getElementById("old-discl").style.display = 'none';
    }
            
            
    // Set up point grid. 
     
    var pointsToTry = [];
    var bigNumber = 100000000000000000;

    for(var iter0 = 1/nn/2; iter0<1; iter0+=1/nn) 
        pointsToTry.push(iter0);
    for(var iter0 = 1; iter0<bigNumber; iter0*=(1+iter0/nn)) 
        pointsToTry.push(iter0);

    pointsToTryBounds = [1/bigNumber].concat(pointsToTry,bigNumber);
 
    var pointsToTryWeight = new Array(pointsToTry.length).fill(0);
    var pointsToTryWeightRW = new Array(pointsToTry.length).fill(0);
    var probAddUp = 0;
    var valAddUp = 0;
    
    if (RandomExitTime) {
        for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {  
            var boundaryPts = [ pointsToTryBounds[iter0+1]/2+pointsToTryBounds[iter0+2]/2, pointsToTryBounds[iter0]/2+pointsToTryBounds[iter0+1]/2];
            pointsToTryWeight[iter0] = 0;
            pointsToTryWeightRW[iter0] = 0;
                
            for (var iter1 = 0; iter1 < nn; iter1++) {  
                var TimeCDF = (1/2 + iter1)/nn;
                var TimeRealized = -Math.log(TimeCDF) * ExitTime;
                var TimeWeight = 1/nn;
                pointsToTryWeight[iter0] += lognormalcdfweight(boundaryPts[0],boundaryPts[1],TimeRealized * ( RiskFreeRate - Volatility*Volatility / 2),Volatility * TimeRealized**.5)*Math.E**(-TimeRealized*RiskFreeRate)*TimeWeight;
                pointsToTryWeightRW[iter0] += lognormalcdfweight(boundaryPts[0],boundaryPts[1],TimeRealized * ( MarketRiskPremium - Volatility*Volatility*2 / 2),Volatility * TimeRealized**.5)*TimeWeight;
            }  
            probAddUp +=  pointsToTryWeightRW[iter0];
            valAddUp += pointsToTry[iter0]*pointsToTryWeight[iter0];
        } 
    } else {
        for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {  
            var boundaryPts = [ pointsToTryBounds[iter0+1]/2+pointsToTryBounds[iter0+2]/2, pointsToTryBounds[iter0]/2+pointsToTryBounds[iter0+1]/2];
            pointsToTryWeight[iter0] = lognormalcdfweight(boundaryPts[0],boundaryPts[1],ExitTime * ( RiskFreeRate - Volatility*Volatility / 2),Volatility * ExitTime**.5)*Math.E**(-ExitTime*RiskFreeRate);
            pointsToTryWeightRW[iter0] = lognormalcdfweight(boundaryPts[0],boundaryPts[1],ExitTime * ( MarketRiskPremium - Volatility*Volatility*2 / 2),Volatility * ExitTime**.5);
            probAddUp = probAddUp + pointsToTryWeightRW[iter0];
            valAddUp += pointsToTry[iter0]*pointsToTryWeight[iter0];
        }  
    }     
     
    
    for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {  
        pointsToTryWeightRW[iter0] /= probAddUp;
    }  
     
    // Backsolve value of company at round

    var backSolvedValue = PMV;
    var scalefactor = 2;     

    InvestmentAmount =  InvestmentAmount+ inOldInv;

    for (var iter1 = 0; iter1 < 20; iter1++) {    
        var preferredValue = backSolvedValue*InvestmentAmount/PMV;
        for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {   
            var simulatedExit = backSolvedValue*pointsToTry[iter0];   
            
            var preferredRawPOMALiq  =  Math.min(InvestmentAmount*LiquidationMultiple,simulatedExit);
            preferredRawPOMALiq  +=  (simulatedExit - preferredRawPOMALiq)*InvestmentAmount/PMV; 
            var preferredRawPOMA = Math.max(Math.min(preferredRawPOMALiq,InvestmentAmount*ParticipationCap), simulatedExit*InvestmentAmount/PMV )  
            preferredRawPOMA  =  Math.min(preferredRawPOMA+InvestmentAmount*CumDiv*ExitTime,simulatedExit); 
            var preferredBonusPOMA = preferredRawPOMA - simulatedExit*InvestmentAmount/PMV;  
            
            var preferredBonusPOIPO =  Math.max( preferredBonusPOMA*BlockIPO*(simulatedExit<=PMV), Math.min(IPORatchetLevel*InvestmentAmount,simulatedExit)-simulatedExit*InvestmentAmount/PMV, 0);
            
            preferredValue +=  (preferredBonusPOIPO*IPOprobability(simulatedExit) + preferredBonusPOMA*(1-IPOprobability(simulatedExit)))*pointsToTryWeight[iter0]; 
        } 
 
        if (InvestmentAmount - preferredValue > 0) { 
            scalefactor=scalefactor**.5;    
            backSolvedValue*=scalefactor;
        }
        else {
            if(scalefactor<2) { 
                scalefactor=scalefactor**.5;    
            }
            backSolvedValue/=scalefactor;
        } 
    }
    
      
    // Process Option strike input
    var OptionStrikeGuessed = false; 
    
    if( inShareType == 0){
        var ShareType= "S";
    } else{
        var ShareType= "O";
    }   
    if( ShareType == "S"){
        var OptionStrikeValuation = 0;
    } else{
        if (  document.getElementById("in-OptionStrikePrice").value.length > 0  ) {
            var OptionStrikeValuation = inOptionStrikePrice * PMV / SharePrice;
        } else {
            var OptionStrikeValuation =  (backSolvedValue - preferredValue )/(1-InvestmentAmount/PMV); 
            OptionStrikeGuessed = true;
        } 
    }    
    
    // Find present value of share classes
    var valueOfCompany = (1+GrowthSinceLastRound)*backSolvedValue;
    
    var preferredValue = valueOfCompany*InvestmentAmount/PMV;
    var commonValue = valueOfCompany*(1-InvestmentAmount/PMV);
    var optionValue = FDOwnership*valueOfCompany;
    var optionValue2 = 0; 
    
    var preferredWFMA = []; 
    var commonWFMA = [];
    var optionWFMA = [];
    var preferredWFIPO = []; 
    var commonWFIPO = [];
    var optionWFIPO = [];
    
    var IPOProb = [];
    var pointsToTryWeightRWIPO = [];
    var pointsToTryWeightRWMA = [];
    
    for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {
        var simulatedExit = valueOfCompany*pointsToTry[iter0];   
        
        
        var preferredRawPOMALiq  =  Math.min(InvestmentAmount*LiquidationMultiple,simulatedExit);
        preferredRawPOMALiq  +=  (simulatedExit - preferredRawPOMALiq)*InvestmentAmount/PMV; 
        var preferredRawPOMA = Math.max(Math.min(preferredRawPOMALiq,InvestmentAmount*ParticipationCap), simulatedExit*InvestmentAmount/PMV )  
        preferredRawPOMA  =  Math.min(preferredRawPOMA+InvestmentAmount*CumDiv*ExitTime,simulatedExit); 
        var preferredBonusPOMA = preferredRawPOMA - simulatedExit*InvestmentAmount/PMV;  
            
        var preferredBonusPOIPO =  Math.max( preferredBonusPOMA*BlockIPO*(simulatedExit<=PMV), Math.min(IPORatchetLevel*InvestmentAmount,simulatedExit)-simulatedExit*InvestmentAmount/PMV, 0);
             
        var commonBonusPOMA = -preferredBonusPOMA;
        var optionBonusPOMA = FDOwnership*Math.max(commonBonusPOMA/(1-InvestmentAmount/PMV)-OptionStrikeValuation,-simulatedExit);
        var commonBonusPOIPO = -preferredBonusPOIPO;
        var optionBonusPOIPO = FDOwnership*Math.max(commonBonusPOIPO/(1-InvestmentAmount/PMV)-OptionStrikeValuation,-simulatedExit);
        
        IPOProb[iter0] = IPOprobability(simulatedExit);
        preferredValue +=  (preferredBonusPOIPO*IPOProb[iter0] + preferredBonusPOMA*(1-IPOProb[iter0]))*pointsToTryWeight[iter0]; 
        commonValue +=  (commonBonusPOIPO*IPOProb[iter0] + commonBonusPOMA*(1-IPOProb[iter0]))*pointsToTryWeight[iter0]; 
        optionValue +=  (optionBonusPOIPO*IPOProb[iter0] + optionBonusPOMA*(1-IPOProb[iter0]))*pointsToTryWeight[iter0]; 

        preferredWFMA[iter0] = preferredBonusPOMA + simulatedExit*InvestmentAmount/PMV;
        commonWFMA[iter0] = commonBonusPOMA + simulatedExit*(1-InvestmentAmount/PMV);
        optionWFMA[iter0] = optionBonusPOMA + simulatedExit*FDOwnership; 
        
        preferredWFIPO[iter0] = preferredBonusPOIPO + simulatedExit*InvestmentAmount/PMV;
        commonWFIPO[iter0] = commonBonusPOIPO + simulatedExit*(1-InvestmentAmount/PMV);
        optionWFIPO[iter0] = optionBonusPOIPO + simulatedExit*FDOwnership; 
        
        
        pointsToTryWeightRWMA[iter0] = pointsToTryWeightRW[iter0]*(1-IPOProb[iter0]);
        pointsToTryWeightRWIPO[iter0] = pointsToTryWeightRW[iter0]*IPOProb[iter0];
        
        optionValue2+= (optionBonusPOIPO*IPOProb[iter0] + optionBonusPOMA*(1-IPOProb[iter0])+ simulatedExit*FDOwnership)*pointsToTryWeight[iter0]; 
    }
    
    optionValue=Math.min(optionValue2/valAddUp,optionValue);

 
 
    // outputs
     
    var optionPMVVal = preferredValue / InvestmentAmount*PMV * FDOwnership;
    var optionPMVToTrueVal = optionValue - optionPMVVal;
    
    var ValuationBG =  optionValue;
    


    document.getElementById('op-ValuationBG').innerHTML = largeDollarFmt(ValuationBG*1e6);
    document.getElementById('op-ValuationBGP').innerHTML = largeDollarFmt(ValuationBG*1e6);
     
     
    document.getElementById('op-PostmoneyValuation').innerHTML = millionDollarFmt(PMV);
    document.getElementById('op-ValueOfCompanyAtRound').innerHTML =  millionDollarFmt(backSolvedValue);
    document.getElementById('op-GrowthSinceLastRound').innerHTML = percentFmt(GrowthSinceLastRound);
    document.getElementById('op-ValueOfCompanyNow').innerHTML =  millionDollarFmt(valueOfCompany);
       
    if ( OptionStrikeGuessed ) {
        document.getElementById('op-ShowOptionStrikePriceGuessed').style.display='';     
    } else {
        document.getElementById('op-ShowOptionStrikePriceGuessed').style.display='none';     
    }        
    
    if (inShowStrike > 0 ){
        document.getElementById('op-StrikePriceRepTable').style.display='';     
    } else {
        document.getElementById('op-StrikePriceRepTable').style.display='none';     
    }        
    
    
    
     
    
    var PreferredValuePerShare = preferredValue / (InvestmentAmount/PMV) /PMV * SharePrice;
    var CommonValuePerShare = commonValue / (1-InvestmentAmount/PMV) /PMV * SharePrice;
    var OptionValuePerShare = optionValue / FDOwnership /PMV * SharePrice;
    
    document.getElementById('op-ValueOfPreferred').innerHTML = dollarFmt(PreferredValuePerShare);    
    document.getElementById('op-ValueOfCommon').innerHTML = dollarFmt(CommonValuePerShare);        
    document.getElementById('op-StrikePriceRep').innerHTML = dollarFmt(inOptionStrikePrice);    
    
      
    if (ShareType == "O") {
        document.getElementById('op-OptionStrikePrice1').style.display='inline';
        document.getElementById('op-OptionStrikePrice1').innerHTML = "An option with exercise price corresponding to a company value of  " + millionDollarFmt(OptionStrikeValuation) + " million";    
        document.getElementById('op-ValueOfOptions').innerHTML = dollarFmt(OptionValuePerShare  ) ;    
                document.getElementById('op-ValueOfOptions').style.display='inline';

    } else {
        document.getElementById('op-OptionStrikePrice1').style.display='none';
                document.getElementById('op-ValueOfOptions').style.display='none';;
                
    }     
       
    oneThousandPoints = [];
    var curCDF = 0;
    for (var i = 0; i < pointsToTryWeightRWIPO.length; i++) {
        curCDF += pointsToTryWeightRWIPO[i];
        while(curCDF>0){
            curCDF-=1/1000;
            oneThousandPoints.push(optionWFIPO[i]);
        } 
    } 
    for (var i = 0; i < pointsToTryWeightRWMA.length; i++) {
        curCDF += pointsToTryWeightRWMA[i];
        while(curCDF>0){
            curCDF-=1/1000;
            oneThousandPoints.push(optionWFMA[i]);
        }     
    }
    
    
    
    oneThousandPoints=oneThousandPoints.sort(function(a, b){return a-b});;
          
    document.getElementById('op-dice1').innerHTML = largeDollarFmt(Math.round(1e8*oneThousandPoints[Math.round(1000*(1/2+0)/6)] )/100);
    document.getElementById('op-dice2').innerHTML = largeDollarFmt(Math.round(1e8*oneThousandPoints[Math.round(1000*(1/2+1)/6)] )/100);
    document.getElementById('op-dice3').innerHTML = largeDollarFmt(Math.round(1e8*oneThousandPoints[Math.round(1000*(1/2+2)/6)] )/100);
    document.getElementById('op-dice4').innerHTML = largeDollarFmt(Math.round(1e8*oneThousandPoints[Math.round(1000*(1/2+3)/6)] )/100);
    document.getElementById('op-dice5').innerHTML = largeDollarFmt(Math.round(1e8*oneThousandPoints[Math.round(1000*(1/2+4)/6)] )/100);
    document.getElementById('op-dice6').innerHTML = largeDollarFmt(Math.round(1e8*oneThousandPoints[Math.round(1000*(1/2+5)/6)] )/100);
    
    
    var myColors = {preferred: 'rgba(225,77,89, 0.8)', common: 'rgba(84,201,255, 0.8)', options: 'rgba(146,194,110, 0.8)', prevvalue: 'rgba(234,174,104, 0.8)'};
 
 
    
    var ctx = document.getElementById('chart-CompanyValue').getContext('2d');
    if(window.cCompanyValue && window.cCompanyValue !== null){
            window.cCompanyValue.destroy();
        }
    
    window.cCompanyValue = new Chart(ctx, {  
        type: 'horizontalBar',
        data: {
            labels: ["Post-money valuation", "Value at last round","Current value"],
            datasets: [{
                data: [PMV,backSolvedValue,valueOfCompany],
                backgroundColor: [myColors.preferred, myColors.prevvalue  ,myColors.common],
                borderColor: [myColors.preferred, myColors.prevvalue ,myColors.common], 
                borderWidth: 2, 
             }]
        },
        options: { 
            maintainAspectRatio: false,
             legend: {
                display: false
             },
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero:true,
                        callback: function(value, index, values) { return millionDollarFmt(value);}
                    },
                  scaleLabel: {
                    display: true,
                    labelString: 'Value (millions)'
                  }
                }]
            }
        }
    });
 
    
 
    if (ShareType == "O") {
        var templables = ["Preferred", "Common", "Option"];
        var tempData = [PreferredValuePerShare,CommonValuePerShare,OptionValuePerShare];
    } else if (inShowStrike){
        var templables = ["Preferred", "Common", "Paid Today"];
        var tempData = [PreferredValuePerShare,CommonValuePerShare,inOptionStrikePrice]; 
    } else {
        var templables = ["Preferred", "Common"];
        var tempData = [PreferredValuePerShare,CommonValuePerShare];
    }
      
      
    var ctx = document.getElementById('chart-RelativeValues').getContext('2d');
    if(window.cRelativeValues && window.cRelativeValues !== null){
            window.cRelativeValues.destroy();
        }    
        
        inShowStrike
        
        
        
        
    window.cRelativeValues = new Chart(ctx,  {
    type: 'bar', 
    data: {
        labels: templables,
        datasets: [{ 
            data: tempData,
            backgroundColor: [myColors.preferred, myColors.common ,myColors.options], 
            borderColor: [myColors.preferred, myColors.common ,myColors.options], 
            borderWidth: 2, 
         }]
    },
    options: { 
        maintainAspectRatio: false,
         legend: {
            display: false
         },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true,
                    callback: function(value, index, values) { return dollarFmt(value);}
                },
              scaleLabel: {
                display: true,
                labelString: 'Share price'
              }
            }]
        }
    }
    }); 
       
  
    
 
    

    var preferredSCD = []; 
    var commonSCD  = []; 
    var optionSCD  = []; 
    var strikeSCD = [];
    
     var tempScale = SharePrice;
        var tempyaxis = 'Future payoff per share';
        var tempcallback =      function(value, index, values) { return dollarFmt(value)};
     
    
    var tempMaxPayoff = tempScale*3.5;

    for (var i = 0; i < pointsToTry.length-1; i++) {
        preferredSCD.push({
            x: pointsToTry[i]*valueOfCompany, 
            y: Math.max(0,Math.min(preferredWFMA[i]/(InvestmentAmount/PMV)/PMV*tempScale,tempMaxPayoff*100))
        }); 
        commonSCD.push({
            x: pointsToTry[i]*valueOfCompany, 
            y: Math.max(0,Math.min(commonWFMA[i]/(1-InvestmentAmount/PMV)/PMV*tempScale,tempMaxPayoff*100))        
        });
        optionSCD.push({
            x: pointsToTry[i]*valueOfCompany,
            y: Math.max(0,Math.min(optionWFMA[i]/FDOwnership/PMV*tempScale,tempMaxPayoff*100))    
        });
        strikeSCD.push({
            x: pointsToTry[i]*valueOfCompany,
            y: inOptionStrikePrice
        });

    }
    
    vartempdatasets = [{
            label: 'Preferred',
            data: preferredSCD,
            fill:false,
            pointRadius:0,
            borderColor: myColors.preferred,
            backgroundColor: myColors.preferred, 
        },{
            label: 'Common',
            data: commonSCD,
            pointRadius:0,
            fill:false,
            borderColor: myColors.common,
            backgroundColor: myColors.common,
        }];
    if( ShareType == "O") {
            vartempdatasets = vartempdatasets.concat([{
                label: 'Option',
                data: optionSCD,
                pointRadius:0,
                fill:false,
                borderColor: myColors.options,
                backgroundColor: myColors.options,
            }]);
    }
    if( inShowStrike ) {
            vartempdatasets = vartempdatasets.concat([{
                label: 'Exercise Price Paid Today',
                data: strikeSCD,
                pointRadius:0,
                fill:false,
                borderColor: myColors.options,
                backgroundColor: myColors.options,
            }]);
    }    
    
    var ctx = document.getElementById('chart-MAWaterfall').getContext('2d');
    if(window.cMAWaterfall && window.cMAWaterfall !== null){
            window.cMAWaterfall.destroy();
        }    
    window.cMAWaterfall =  new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: vartempdatasets
        },
        options: { 
            maintainAspectRatio: false,
             scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Company value at exit (millions)'
                    },
                    ticks: {
                        min: 0,
                        max: roundToNearest(3*PMV),
                        callback: function(value, index, values) { return millionDollarFmt(value)}
                    }
                }],

                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: tempyaxis
                    },
                    type: 'linear',             
                    ticks: {
                        min: 0,
                        max: roundToNearest(tempMaxPayoff),
                        maxRotation: 0,
                        minRotation: 0,
                        callback: tempcallback 
                    }
                }]
            }
        }
    });
 

    
    var preferredSCD = []; 
    var commonSCD  = []; 
    var optionSCD  = []; 
    
    for (var i = 0; i < pointsToTry.length-1; i++) {
        preferredSCD.push({
            x: pointsToTry[i]*valueOfCompany, 
            y: Math.max(0,Math.min(preferredWFIPO[i]/(InvestmentAmount/PMV)/PMV*tempScale,tempMaxPayoff*100))
        }); 
        commonSCD.push({
            x: pointsToTry[i]*valueOfCompany, 
            y: Math.max(0,Math.min(commonWFIPO[i]/(1-InvestmentAmount/PMV)/PMV*tempScale,tempMaxPayoff*100))        
        });
        optionSCD.push({
            x: pointsToTry[i]*valueOfCompany,
            y: Math.max(0,Math.min(optionWFIPO[i]/FDOwnership/PMV*tempScale,tempMaxPayoff*100))    
        });
        strikeSCD.push({
            x: pointsToTry[i]*valueOfCompany,
            y: inOptionStrikePrice
        });
    }
    
    vartempdatasets = [{
            label: 'Preferred',
            data: preferredSCD,
            fill:false,
            pointRadius:0,
            borderColor: myColors.preferred,
            backgroundColor: myColors.preferred, 
        },{
            label: 'Common',
            data: commonSCD,
            pointRadius:0,
            fill:false,
            borderColor: myColors.common,
            backgroundColor: myColors.common,
        }];
    if( ShareType == "O") {
            vartempdatasets = vartempdatasets.concat([{
                label: 'Option',
                data: optionSCD,
                pointRadius:0,
                fill:false,
                borderColor: myColors.options,
                backgroundColor: myColors.options, 
            }]);
    }   
    if( inShowStrike ) {
            vartempdatasets = vartempdatasets.concat([{
                label: 'Exercise Price Paid Today',
                data: strikeSCD,
                pointRadius:0,
                fill:false,
                borderColor: myColors.options,
                backgroundColor: myColors.options,
            }]);
    }    

    var ctx = document.getElementById('chart-IPOWaterfall').getContext('2d');
    if(window.cIPOWaterfall && window.cIPOWaterfall !== null){
            window.cIPOWaterfall.destroy();
        }    
    window.cIPOWaterfall  = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: vartempdatasets
        },
        options: { 
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Company value at exit (millions)'
              },
                    ticks: {
                        min: 0,
                        max: roundToNearest(3*PMV),
                        callback: function(value, index, values) { return millionDollarFmt(value)}
                    }
                }],

                yAxes: [{
              scaleLabel: {
                display: true,
                labelString: tempyaxis
              },
                    type: 'linear',             
                    ticks: {
                        min: 0,
                        max: roundToNearest(tempMaxPayoff),
                        callback: tempcallback 
                    }
                }]
            }
        }
    });



 


    var optionSCD2  = [];  
    
    for (var i = 0; i < oneThousandPoints.length; i++) { 
        optionSCD2.push({
            x: (1/2+i)/1000*100,
            y: Math.min(oneThousandPoints[i]*1e6,PMV*1e6*100)
        });
        strikeSCD.push({
            x: (1/2+i)/1000*100,
            y: inOptionStrikePrice*inNumberOptionsOwned
        }); 
    }
    
    
     
    
    if( inShowStrike ) { 
        var     vartempdatasets = [{
                    label: 'Payoff Received in Future',
                    data: optionSCD2,
                    pointRadius:0, 
                    borderColor: myColors.common, 
                    backgroundColor: myColors.common,  
                },]
                
            vartempdatasets = vartempdatasets.concat([{
                label: 'Exercise Price Paid Today',
                data: strikeSCD,
                pointRadius:0,
                fill:false,
                borderColor: myColors.options,
                backgroundColor: myColors.options,
            }]);
    } else { 
    
        var     vartempdatasets = [{
                    label: 'Option CDF',
                    data: optionSCD2,
                    pointRadius:0, 
                    borderColor: myColors.options, 
                    backgroundColor: myColors.options,  
                },]
    }
                  
    
    

    var ctx = document.getElementById('chart-PayoffDistribution').getContext('2d');
    if(window.cPayoffDistribution && window.cPayoffDistribution !== null){
            window.cPayoffDistribution.destroy();
        }    
    window.cPayoffDistribution  = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: vartempdatasets
        },
        options: { 
            maintainAspectRatio: false, 
            legend: {     
                display: inShowStrike==true
            },
            scales: {
                yAxes: [{  
                    ticks: {
                        min: 0,
                        max: roundToNearest(PMV*FDOwnership*1e6*4),
                        callback: function(value, index, values) { return largeDollarFmt(value)}

                    },
                  scaleLabel: {
                    display: true,
                    labelString: 'Total payoff of shares'
                  },
                }],

                xAxes: [{
                    type: 'linear',
                    ticks: {
                        min: 0,
                        max: 100
                    },
                  scaleLabel: {
                    display: true,
                    labelString: 'Percentile of outcome distribution'
                  },
                }]
            }
        }
    });
    
}


function erf(x) {
  // save the sign of x
  var sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // constants
  var a1 =  0.254829592;
  var a2 = -0.284496736;
  var a3 =  1.421413741;
  var a4 = -1.453152027;
  var a5 =  1.061405429;
  var p  =  0.3275911;

  // A&S formula 7.1.26
  var t = 1.0/(1.0 + p*x);
  var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y; // erf(-x) = -erf(x);
}
 

function updatevisibleinputs() {
    if(  document.getElementsByName("in-ShareType")[1].checked | document.getElementsByName("in-ShareType")[2].checked ) {
        document.getElementById("OptionStrikePrice").style.display = '';
    }
    else {
        document.getElementById("OptionStrikePrice").style.display = 'none';
    }    
    
    if(  document.getElementsByName("in-Participation")[3].checked ) {
        document.getElementById("ParticipationCap").style.display = '';
    }
    else {
        document.getElementById("ParticipationCap").style.display = 'none';
    }
    
    if(  document.getElementsByName("in-CustomParameters")[1].checked ) {
        document.getElementById("CustomParameters1").style.display = '';
     }
    else {
        document.getElementById("CustomParameters1").style.display = 'none';
    }
    
    if(  document.getElementsByName("in-IPORatchet")[2].checked ) {
        document.getElementById("IPORatchetLevel").style.display = '';
    }
    else {
        document.getElementById("IPORatchetLevel").style.display = 'none';
    }
            
     
    
}

function onrefreshloop() { 
 
    if( document.getElementById("in-NumberOptionsOwned").value*1 > 0 ){
        document.getElementById("in-NumberOptionsOwned").style.cssText  = "border: solid black !important";     
    } else {
        document.getElementById("in-NumberOptionsOwned").style.cssText  = "border: solid red !important";         
    }
    
    
    if( companyLoaded == -1 ){
        document.getElementById("button-load").style.backgroundColor  = "red";    
        document.getElementById("button-not-listed").style.backgroundColor  = "red";     
    } else {
        document.getElementById("button-load").style.backgroundColor  = "blue";    
        document.getElementById("button-not-listed").style.backgroundColor  = "blue";         
    }
    
     
    if(  document.getElementsByName("in-ShareType")[2].checked && document.getElementById("in-OptionStrikePrice").value == 0) {
        document.getElementById("in-OptionStrikePrice").style.cssText = "border: solid red !important";     
        document.getElementById("in-OptionStrikePrice").placeholder  = "Required";         
    }
    else {
        document.getElementById("in-OptionStrikePrice").style.cssText = "border: solid black !important";    
        document.getElementById("in-OptionStrikePrice").placeholder  = "Unsure";         
    }    
    
    
 
    if( document.getElementById("in-NumberOptionsOwned").value*1 > 0 ){
        document.getElementById("in-NumberOptionsOwned").style.cssText  = "border: solid black !important";     
    } else {
        document.getElementById("in-NumberOptionsOwned").style.cssText  = "border: solid red !important";         
    }
    
     
    
    if( document.getElementById("in-PMV").value*1 > 0 ){
        document.getElementById("in-PMV").style.cssText  = "border: solid black !important";     
    } else {
        document.getElementById("in-PMV").style.cssText  = "border: solid red !important";         
    }
    
    if( document.getElementById("in-SharePrice").value*1 > 0 ){
        document.getElementById("in-SharePrice").style.cssText  = "border: solid black !important";     
    } else {
        document.getElementById("in-SharePrice").style.cssText  = "border: solid red !important";         
    }
    
    if( companyLoaded > -1 ){
        document.getElementById("myInput").style.cssText  = "border: solid black  !important";    
    } else {
        document.getElementById("myInput").style.cssText  = "border: solid red !important";         
    }

    updatevisibleinputs(); 
    valueoptions();
 }