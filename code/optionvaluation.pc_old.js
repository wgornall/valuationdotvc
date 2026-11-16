/*!
 * Option valuation code v0.6
 * Copyright 2019 Will Gornall
 */
 
 
 
	var companyLoaded = -1;
	var CompanyIndex = 0;
	var monthlyPriceHistory = [];
	var monthlyPriceHistoryIndex = [];
	var trialCoName;
	
		$(document).ready(function() { 
			$('.footer').scrollToFixed( {
				bottom: 10,
				limit: function() { return $('.footer-marker').offset().top; }
			}); 
		});		 
			

		function loadCoData() {
			trialCoName = document.getElementById("myInput").value;
			
			if (trialCoName =="") {
				trialCoName = "Blank";
			} 
			
			CompanyIndex = uCompany.indexOf(trialCoName);
			
			if	(CompanyIndex < 0 ) {	
				companyLoaded = 0;
				document.getElementById("DataMissing").style.display = 'block';
				document.getElementById("DataFound").style.display = 'none';
				document.getElementById("DataFull").style.display = 'block';
				document.getElementById("DataMissingCo").innerHTML = trialCoName;

			 
				document.getElementById("in-SharePrice-early").value =  "";   

			} else { 
				companyLoaded = 1;
				document.getElementById("DataFound").style.display = 'block';
				document.getElementById("DataMissing").style.display = 'none';
				document.getElementById("DataFull").style.display = 'block';
				document.getElementById("DataFoundCo").innerHTML = "Attempting to load data for "+trialCoName+" under ticker "+uTicker[CompanyIndex]+". If this message does not disappear within 20 seconds, press Load Data again or try again later.";
				  
				callFinancialAPI();
				 
			}
			
				
			onrefreshloop();
		};


		function callFinancialAPI() {
	
			var request = new XMLHttpRequest();
			request.open('GET', 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol='+uTicker[CompanyIndex]+'&apikey=VXGMPH86FMR9R4M4', true);
			// if you steal my API key, you are a meanie.

							
			request.onload = function() {
				var data = JSON.parse(this.response); 
				document.getElementById("in-Ticker").value = data["Meta Data"]["2. Symbol"];		
				
				monthlyPriceHistory = [];
				for(var month in data["Monthly Time Series"]) {
				  monthlyPriceHistory.push(data["Monthly Time Series"][month]["4. close"]);
				}
				
				document.getElementById("in-SharePrice-early").value = Math.round(100*monthlyPriceHistory[0])/100;		 
			    callFinancialAPI2()
			}
			request.send(); 
				
				 
		};
		
		function callFinancialAPI2() { 
			var request = new XMLHttpRequest();
			request.open('GET', 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=SPY&apikey=VXGMPH86FMR9R4M4', true);
			// if you steal my API key, you are a meanie.
 
			request.onload = function() {
				var data = JSON.parse(this.response);  
				
				monthlyPriceHistoryIndex = [];
				for(var month in data["Monthly Time Series"]) {
				  monthlyPriceHistoryIndex.push(data["Monthly Time Series"][month]["4. close"]);
				} 
				 
				callFinancialAPI3() 
			}
			request.send();   
		};
		
		
		function callFinancialAPI3() { 
	
			var monthlyPriceChanges = [];
			for(var i=1; i< monthlyPriceHistory.length; i++) {
				monthlyPriceChanges.push(Math.log(monthlyPriceHistory[i]/monthlyPriceHistory[i-1]));
			} 
			
			var monthlyIndexPriceChanges = [];
			for(var i=1; i< monthlyPriceHistoryIndex.length; i++) {
				monthlyIndexPriceChanges.push(Math.log(monthlyPriceHistoryIndex[i]/monthlyPriceHistoryIndex[i-1]));
			}  
		
			var monthlyRetSum = 0;
			var monthlyIndexRetSum = 0;
			var monthlyRetSumOfSq = 0;
			var monthlyIndexRetSumOfSq = 0;
			var monthlyRetSumOfCrossProd = 0;
			var monthlyVolatilityMonths = 0; 
			for(var i=1; i< Math.min(60,monthlyPriceChanges.length); i++) {
				if( Math.abs(monthlyPriceChanges[i]) < 5){
					monthlyVolatilityMonths++;
					monthlyRetSum += monthlyPriceChanges[i];
					monthlyIndexRetSum += monthlyIndexPriceChanges[i];
					monthlyIndexRetSumOfSq += monthlyIndexPriceChanges[i]*monthlyIndexPriceChanges[i];
					monthlyRetSumOfSq += monthlyPriceChanges[i]*monthlyPriceChanges[i]; 
					monthlyRetSumOfCrossProd += monthlyPriceChanges[i]*monthlyIndexPriceChanges[i]; 
				}
			} 
			
		
			var volatility = Math.sqrt(12*(monthlyRetSumOfSq - monthlyRetSum*monthlyRetSum/monthlyVolatilityMonths)/(monthlyVolatilityMonths-1));
			document.getElementById("in-Volatility").value = Math.round(100* volatility*10)/10;
			
			var indexVolatility = Math.sqrt(12*(monthlyIndexRetSumOfSq - monthlyIndexRetSum*monthlyIndexRetSum/monthlyVolatilityMonths)/(monthlyVolatilityMonths-1));
 			 
			var beta =  (monthlyRetSumOfCrossProd - monthlyRetSum*monthlyIndexRetSum/monthlyVolatilityMonths)/(monthlyIndexRetSumOfSq - monthlyIndexRetSum*monthlyIndexRetSum/monthlyVolatilityMonths);
			document.getElementById("in-Beta").value = Math.round(beta*100)/100;


				document.getElementById("DataFoundCo").innerHTML = "Data for "+trialCoName+" loaded.";
			
			onrefreshloop();
		};
		
		
 
function lognormalcdfweight(x1, x2, mean, std) {
  return 0.5 * (1 + erf((Math.log(x1) - mean) / (Math.sqrt(2) * std))) -
		 0.5 * (1 + erf((Math.log(x2) - mean) / (Math.sqrt(2) * std)));
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
	return Math.ceil(maxPayout*10/temp)/10*temp;
};  


function valueoptions() {  



 
	// Load all inputs 
	var inShareType=			0*document.getElementsByName("in-ShareType")[0].checked +  
								1*document.getElementsByName("in-ShareType")[1].checked; 
	var inNumberOptionsOwned = 	1*document.getElementById("in-NumberOptionsOwned").value;  
	var inSharePrice = 			1*document.getElementById("in-SharePrice-early").value; 
  
	var inOptionStrikePrice = 	1*document.getElementById("in-OptionStrikePrice").value; 
	var inOptionExpiration = 			1*document.getElementById("in-OptionExpiration").value; 
 
	var inVolatility = 			1*document.getElementById("in-Volatility").value;
	var inBeta = 	 			1*document.getElementById("in-Beta").value; 
	var inRiskFreeRate = 		1*document.getElementById("in-RiskFreeRate").value;  
	var inMarketRiskPremium = 	1*document.getElementById("in-MarketRiskPremium").value; 
	var inScenarios = 			1*document.getElementById("in-Scenarios").value; 
 

	// Process Step 1 inputs 
	var SharePrice = inSharePrice;
	var SharePriceValid = SharePrice > 0; 
	  
	 
	if ( SharePrice>0 && inVolatility>0 ) {
		if (window.innerWidth>600 && window.innerHeight > 500 ) {
			document.getElementById('Incomplete-footer').style.display='none';	 
			document.getElementById('PC-footer').style.display='block';	 
			document.getElementById('Phone-footer').style.display='none';
		} else {
			document.getElementById('Incomplete-footer').style.display='none';	 
			document.getElementById('PC-footer').style.display='none';	 
			document.getElementById('Phone-footer').style.display='block'; 
		}	 
		document.getElementById('Output-data').style.display='';	 
		
	} else {
		document.getElementById('Incomplete-footer').style.display='block';	 
		document.getElementById('PC-footer').style.display='none';	 
		document.getElementById('Phone-footer').style.display='none';	 
		return;
	}
	 
	    
	// Process Step 4 inputs 
	if( inOptionExpiration > 0  ){ 
		var OptionExpiration =	inOptionExpiration;
	} else{
		var OptionExpiration = 1;
	} 
	
	
	
	if( inVolatility > 0  ){ 
		var Volatility =	inVolatility/100;
	} else{
		var Volatility = 0.9;
	}
	if( inBeta > 0   ){ 
		var Beta =	inBeta;
	} else{
		var Beta = 2;
	}
	if( inRiskFreeRate > 0   ){ 
		var RiskFreeRate =	inRiskFreeRate/100;
	} else{
		var RiskFreeRate = 0.02;
	}
	if( inMarketRiskPremium > 0 ){ 
		var MarketRiskPremium =	inMarketRiskPremium/100;
	} else{
		var MarketRiskPremium = 0.05;
	}
	 
	if( inScenarios > 10 ){ 
		var nn =	inScenarios/2*10;
	} else{
		var nn = 100/2*10;
	}
	
	// Set up point grid. 
	 
	var pointsToTry = [];
	var bigNumber = 1000;

	for(var iter0 = 1/nn/2; iter0<1; iter0+=1/nn) 
		pointsToTry.push(iter0);
	for(var iter0 = 1; iter0<bigNumber; iter0*=(1+iter0/nn)) 
		pointsToTry.push(iter0);

	pointsToTryBounds = [1/bigNumber].concat(pointsToTry,bigNumber);
 
	var pointsToTryWeight = new Array(pointsToTry.length).fill(0);
	var pointsToTryWeightRW = new Array(pointsToTry.length).fill(0);
	var probAddUp = 0;
	var valAddUp = 0;
	
	for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {  
		var boundaryPts = [ pointsToTryBounds[iter0+1]/2+pointsToTryBounds[iter0+2]/2, pointsToTryBounds[iter0]/2+pointsToTryBounds[iter0+1]/2];
		pointsToTryWeight[iter0] = lognormalcdfweight(boundaryPts[0],boundaryPts[1],OptionExpiration * ( RiskFreeRate - Volatility*Volatility / 2),Volatility * OptionExpiration**.5)*Math.E**(-OptionExpiration*RiskFreeRate);
		pointsToTryWeightRW[iter0] = lognormalcdfweight(boundaryPts[0],boundaryPts[1],OptionExpiration * ( MarketRiskPremium - Volatility*Volatility*2 / 2),Volatility * OptionExpiration**.5);
		probAddUp = probAddUp + pointsToTryWeightRW[iter0];
		valAddUp += pointsToTry[iter0]*pointsToTryWeight[iter0];
	}  
	 
	
	for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {  
		pointsToTryWeightRW[iter0] /= probAddUp;
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
		if (  document.getElementById("in-OptionStrikePrice").value.length > 0  && SharePriceValid ) {
			var OptionStrikeValuation = inOptionStrikePrice;
		} else {
			var OptionStrikeValuation =  SharePrice; 
			OptionStrikeGuessed = true;
		} 
	}    
	
	// Find present value of share classes
	var valueOfCompany = SharePrice;
	 
	var commonValue = SharePrice;
	var optionValue = SharePrice;
	var optionValue2 = 0; 
	
 	var commonWFMA = [];
	var optionWFMA = []; 
	 
	var pointsToTryWeightRWMA = [];
	
	for (var iter0 = 0; iter0 < pointsToTry.length; iter0++) {
		var simulatedExit = valueOfCompany*pointsToTry[iter0];   
		
		var optionBonusPOMA = Math.max(-OptionStrikeValuation,-simulatedExit);
  
		optionValue +=   optionBonusPOMA *pointsToTryWeight[iter0]; 
 
		commonWFMA[iter0] = simulatedExit;
		optionWFMA[iter0] = optionBonusPOMA + simulatedExit; 
		 
		
		pointsToTryWeightRWMA[iter0] = pointsToTryWeightRW[iter0]; 
		
		optionValue2+= (optionBonusPOMA + simulatedExit)*pointsToTryWeight[iter0]; 
	}
	
	optionValue=Math.min(optionValue2/valAddUp,optionValue);

 
 
	// outputs
	  
	var ValuationBG =  optionValue*inNumberOptionsOwned;
 


	document.getElementById('op-ValuationBG').innerHTML = largeDollarFmt(ValuationBG);
	document.getElementById('op-ValuationBGP').innerHTML = largeDollarFmt(ValuationBG);
	  	   
		   
	if ( OptionStrikeGuessed ) {
		document.getElementById('op-ShowOptionStrikePriceGuessed').style.display='block';	 
	} else {
		document.getElementById('op-ShowOptionStrikePriceGuessed').style.display='none';	 
	}		
	   
	
 	var CommonValuePerShare = commonValue ;
	var OptionValuePerShare = optionValue ;
	
	document.getElementById('op-ValueOfCommon').innerHTML = dollarFmt(CommonValuePerShare);	
	  
	if (ShareType == "O") {
		document.getElementById('op-Options').style.display='inline';
		document.getElementById('op-OptionStrikePrice1').innerHTML = "An option with strike price  of  " + dollarFmt(OptionStrikeValuation);	
		document.getElementById('op-ValueOfOptions').innerHTML = dollarFmt(OptionValuePerShare  ) ;	
			document.getElementById('op-OptionStrikePrice2').innerHTML = inNumberOptionsOwned.toLocaleString('en-US', { maximumSignificantDigits : 3 })+" options with that strike price";	
	} else {
		document.getElementById('op-Options').style.display='none';
	  		document.getElementById('op-OptionStrikePrice2').innerHTML = inNumberOptionsOwned.toLocaleString('en-US', { maximumSignificantDigits : 3 }) +" common shares";;	

 	}	 
	document.getElementById('op-ValueOfAllOptions').innerHTML = largeDollarFmt(optionValue*inNumberOptionsOwned);	
	   
	oneThousandPoints = [];
	var curCDF = 0; 
	for (var i = 0; i < pointsToTryWeightRWMA.length; i++) {
		curCDF += pointsToTryWeightRWMA[i];
		while(curCDF>0){
			curCDF-=1/1000;
			oneThousandPoints.push(optionWFMA[i]);
		} 	
	}
		  	
	document.getElementById('op-dice1').innerHTML = largeDollarFmt(inNumberOptionsOwned*oneThousandPoints[Math.round(1000*(1/2+0)/6)] );
	document.getElementById('op-dice2').innerHTML = largeDollarFmt(inNumberOptionsOwned*oneThousandPoints[Math.round(1000*(1/2+1)/6)] );
	document.getElementById('op-dice3').innerHTML = largeDollarFmt(inNumberOptionsOwned*oneThousandPoints[Math.round(1000*(1/2+2)/6)] );
	document.getElementById('op-dice4').innerHTML = largeDollarFmt(inNumberOptionsOwned*oneThousandPoints[Math.round(1000*(1/2+3)/6)] );
	document.getElementById('op-dice5').innerHTML = largeDollarFmt(inNumberOptionsOwned*oneThousandPoints[Math.round(1000*(1/2+4)/6)] );
	document.getElementById('op-dice6').innerHTML = largeDollarFmt(inNumberOptionsOwned*oneThousandPoints[Math.round(1000*(1/2+5)/6)] ); 
    
	
	var myColors = {common: 'rgba(84,201,255, 0.8)', options: 'rgba(146,194,110, 0.8)', prevvalue: 'rgba(234,174,104, 0.8)'};
  
	if (ShareType == "O") {
		var templables = ["Common", "Option"];
		var tempData = [CommonValuePerShare,OptionValuePerShare];
	} else {
		var templables = ["Common"];
		var tempData = [CommonValuePerShare];
	}


	maxPayout = Math.max(CommonValuePerShare*1.1,OptionValuePerShare*1.1);
	tempMaxPayoff = Math.pow(10,Math.ceil(Math.log(maxPayout)/Math.log(10)));
	tempMaxPayoff = Math.ceil(maxPayout*10/tempMaxPayoff)/10*tempMaxPayoff;


	var ctx = document.getElementById('chart-RelativeValues').getContext('2d');
	if(window.cRelativeValues && window.cRelativeValues !== null){
			window.cRelativeValues.destroy();
		}	
	window.cRelativeValues = new Chart(ctx,  {
	type: 'bar',
	data: {
		labels: templables,
		datasets: [{ 
			data: tempData,
			backgroundColor: [myColors.common ,myColors.options], 
			borderColor: [myColors.common ,myColors.options], 
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
					min: 0,
					max: tempMaxPayoff,
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
	   
 

	var commonSCD  = []; 
	var optionSCD  = []; 
	
	var tempyaxis = 'Payoff per share';
	var tempcallback = 	 function(value, index, values) { return dollarFmt(value)};

	
	maxPayout = Math.max(OptionStrikeValuation*2,SharePrice*2);
	tempMaxPayoff = Math.pow(10,Math.ceil(Math.log(maxPayout)/Math.log(10)));
	tempMaxPayoff = Math.ceil(maxPayout*10/tempMaxPayoff)/10*tempMaxPayoff;	

	for (var i = 0; i < pointsToTry.length-1; i++) {
		commonSCD.push({
			x: pointsToTry[i]*valueOfCompany, 
			y: Math.max(0,Math.min(commonWFMA[i],tempMaxPayoff))		
		});
		optionSCD.push({
			x: pointsToTry[i]*valueOfCompany,
			y: Math.max(0,Math.min(optionWFMA[i],tempMaxPayoff))	
		});
	}
	
	vartempdatasets = [{
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
						labelString: 'Future company share price'
				    },
					ticks: {
						min: 0,
						max: tempMaxPayoff,
						callback: function(value, index, values) { return dollarFmt(value)}
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
						max: tempMaxPayoff,
						maxRotation: 0,
						minRotation: 0,
						callback: tempcallback 
					}
				}]
			}
		}
	});
  
 


	var optionSCD2  = [];  
	
	for (var i = 0; i < oneThousandPoints.length; i++) { 
		optionSCD2.push({
			x: i/1000*100,
			y: Math.min(oneThousandPoints[i]*inNumberOptionsOwned,inNumberOptionsOwned*SharePrice*100)
		});
	}
	
	maxPayout = oneThousandPoints[oneThousandPoints.length-1]*inNumberOptionsOwned;
	tempYAxisMax = Math.pow(10,Math.ceil(Math.log(maxPayout)/Math.log(10)));
	tempYAxisMax = Math.ceil(maxPayout*10/tempYAxisMax)/10*tempYAxisMax;

	var ctx = document.getElementById('chart-PayoffDistribution').getContext('2d');
	if(window.cPayoffDistribution && window.cPayoffDistribution !== null){
			window.cPayoffDistribution.destroy();
		}	
	window.cPayoffDistribution  = new Chart(ctx, {
		type: 'scatter',
		data: {
			datasets: [{
				label: 'Option CDF',
				data: optionSCD2,
				pointRadius:0, 
				borderColor: myColors.options, 
				backgroundColor: myColors.options,  
			},]
		},
		options: { 
			maintainAspectRatio: false,
			legend: {
				display: false
			},
			scales: {
				yAxes: [{  
					ticks: {
						min: 0,
						max: tempYAxisMax,
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
	if(  document.getElementsByName("in-ShareType")[1].checked ) {
		document.getElementById("OptionStrikePrice").style.display = '';
		document.getElementById("OptionExpirationText").style.display = '';
				document.getElementById("OptionExpirationTextForShares").style.display = 'none';

		document.getElementById("DataRelevantForOptions").style.display = '';

	}
	else {
		document.getElementById("OptionStrikePrice").style.display = 'none';
		document.getElementById("OptionExpirationText").style.display = 'none';
		document.getElementById("OptionExpirationTextForShares").style.display = '';

		document.getElementById("DataRelevantForOptions").style.display = 'none';
		
	}	  
	
}

function onrefreshloop() { 
 
	
	if( companyLoaded == -1 ){
		document.getElementById("button-load").style.backgroundColor  = "red";	  
	} else {
		document.getElementById("button-load").style.backgroundColor  = "blue";	 
	}
	
	
	
	if( document.getElementById("in-NumberOptionsOwned").value*1 > 0 ){
		document.getElementById("in-NumberOptionsOwned").style.cssText  = "border: none !important";	 
	} else {
		document.getElementById("in-NumberOptionsOwned").style.cssText  = "border: solid red !important";	 	
	}
	  
	if( companyLoaded > -1 ){
		document.getElementById("myInput").style.cssText  = "border: none  !important";	
	} else {
		document.getElementById("myInput").style.cssText  = "border: solid red !important";	 	
	}

	updatevisibleinputs(); 
	valueoptions();
 }