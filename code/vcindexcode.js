
 
 
am4core.ready(function() {

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

// Create chart
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.padding(0, 15, 0, 15);

// Load external data
chart.dataSource.url = "data/gss-vc-index.csv";
chart.dataSource.parser = new am4core.CSVParser();
chart.dataSource.parser.options.useColumnNames = true;
chart.dataSource.parser.options.reverse = true;
 
chart.leftAxesContainer.layout = "vertical";
 
chart.bottomAxesContainer.reverseOrder = true;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.grid.template.location = 0;
dateAxis.renderer.ticks.template.length = 8;
dateAxis.renderer.ticks.template.strokeOpacity = 0.1;
dateAxis.renderer.grid.template.disabled = true;
dateAxis.renderer.ticks.template.disabled = false;
dateAxis.renderer.ticks.template.strokeOpacity = 0.1;
dateAxis.renderer.minLabelPosition = 0.01;
dateAxis.renderer.maxLabelPosition = 0.99;
dateAxis.keepSelection = true;
dateAxis.renderer.minGridDistance  = 50;
dateAxis.minHeight = 30;

dateAxis.groupData = true;
dateAxis.minZoomCount = 5; 

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.zIndex = 1;
valueAxis.renderer.baseGrid.disabled = true;
// height of axis
valueAxis.height = am4core.percent(65);

valueAxis.renderer.gridContainer.background.fill = am4core.color("#000000");
valueAxis.renderer.gridContainer.background.fillOpacity = 0.02;
valueAxis.renderer.inside = true;
valueAxis.renderer.labels.template.verticalCenter = "bottom";
valueAxis.renderer.labels.template.padding(2, 2, 2, 2);

//valueAxis.renderer.maxLabelPosition = 0.95;
valueAxis.renderer.fontSize = "1em"

var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.dateX = "Date";
series.dataFields.valueY = "Index";
series.tooltipText = "{valueY.value}";
series.name = "MSFT: Value";
series.strokeWidth = 3;
series.defaultState.transitionDuration = 0;
 
chart.cursor = new am4charts.XYCursor();

var scrollbarX = new am4charts.XYChartScrollbar();
scrollbarX.series.push(series);
scrollbarX.marginBottom = 20;
scrollbarX.scrollbarChart.xAxes.getIndex(0).minHeight = undefined;
chart.scrollbarX = scrollbarX;


/**
 * Set up external controls
 */

// Date format to be used in input fields
var inputFieldFormat = "yyyy-MM-dd";
  
dateAxis.events.on("selectionextremeschanged", function() {
  updateFields();
});

dateAxis.events.on("extremeschanged", updateFields);

function updateFields() {
  var minZoomed = dateAxis.minZoomed + am4core.time.getDuration(dateAxis.mainBaseInterval.timeUnit, dateAxis.mainBaseInterval.count) * 0.5;
  document.getElementById("fromfield").value = chart.dateFormatter.format(minZoomed, inputFieldFormat);
  document.getElementById("tofield").value = chart.dateFormatter.format(new Date(dateAxis.maxZoomed), inputFieldFormat);
}

document.getElementById("fromfield").addEventListener("keyup", updateZoom);
document.getElementById("tofield").addEventListener("keyup", updateZoom);

var zoomTimeout;
function updateZoom() {
  if (zoomTimeout) {
    clearTimeout(zoomTimeout);
  }
  zoomTimeout = setTimeout(function() {
    var start = document.getElementById("fromfield").value;
    var end = document.getElementById("tofield").value;
    if ((start.length < inputFieldFormat.length) || (end.length < inputFieldFormat.length)) {
      return;
    }
    var startDate = chart.dateFormatter.parse(start, inputFieldFormat);
    var endDate = chart.dateFormatter.parse(end, inputFieldFormat);

    if (startDate && endDate) {
      dateAxis.zoomToDates(startDate, endDate);
    }
  }, 500);
}

function zoomToDates(date) {
  var min = dateAxis.groupMin["day1"];
  var max = dateAxis.groupMax["day1"];
  dateAxis.keepSelection = true;
  //dateAxis.start = (date.getTime() - min)/(max - min);
  //dateAxis.end = 1;

  dateAxis.zoom({start:(date.getTime() - min)/(max - min), end:1});
}

}); // end am4core.ready()


 var StockPrices;
 
 
function initialprep(){
	Papa.parse("data/gss-vc-index.csv", {
		download: true,
		header: true,
		dynamicTyping: true,
		complete: function(results) {
			StockPrices = results; 
			document.getElementById('currentIndexLevel').innerHTML = StockPrices.data[0]['Index'];
			document.getElementById('currentDate').innerHTML = StockPrices.data[0]['Date'];
			document.getElementById('lastIndexLevel').innerHTML = StockPrices.data[1]['Index'];
			document.getElementById('lastDate').innerHTML = StockPrices.data[1]['Date'];
			document.getElementById('updatedDate').innerHTML = StockPrices.data[0]['Posted'];

			document.getElementById('indexChange').innerHTML = (Math.round((StockPrices.data[0]['Index']-StockPrices.data[1]['Index'])*100)/100) + "  (" + (Math.round((StockPrices.data[0]['Index']-StockPrices.data[1]['Index'])/StockPrices.data[1]['Index']*10000)/100) + "%)" ;
			if(StockPrices.data[0]['Index']>StockPrices.data[1]['Index']) {
				document.getElementById('indexChange').style.color = "green";
			}	else if(StockPrices.data[0]['Index']<StockPrices.data[1]['Index']) {
				document.getElementById('indexChange').style.color = "red";
			} else { 
				document.getElementById('indexChange').style.color = "black";
			}
		generateDynamicTable();			
		}
	}); 

} 
 
function generateDynamicTable(){
	
		var noOfContacts = StockPrices.data.length;
		
		if(noOfContacts>0){
			
 
			// CREATE DYNAMIC TABLE.
			var table = document.createElement("table");
			table.style.width = '100%';
			
			// retrieve column header ('Name', 'Email', and 'Mobile')
 
			var col = []; // define an empty array
			for (var i = 0; i < noOfContacts; i++) {
				for (var key in StockPrices.data[i]) {
					if (col.indexOf(key) === -1) {
						col.push(key);
					}
				}
			}
			
			// CREATE TABLE HEAD .
			var tHead = document.createElement("thead");	
				
			
			// CREATE ROW FOR TABLE HEAD .
			var hRow = document.createElement("tr");
			
			// ADD COLUMN HEADER TO ROW OF TABLE HEAD.
			for (var i = 0; i < col.length; i++) {
					var th = document.createElement("th");
					th.innerHTML = col[i];
					hRow.appendChild(th);
			}
			tHead.appendChild(hRow);
			table.appendChild(tHead);
			
			// CREATE TABLE BODY .
			var tBody = document.createElement("tbody");	
			
			// ADD COLUMN HEADER TO ROW OF TABLE HEAD.
			for (var i = 0; i < 12; i++) {
			
					var bRow = document.createElement("tr"); // CREATE ROW FOR EACH RECORD .
					
					
					for (var j = 0; j < col.length; j++) {
						var td = document.createElement("td");
						td.innerHTML = StockPrices.data[i][col[j]];
						bRow.appendChild(td);
					}
					tBody.appendChild(bRow)
 
			}
			table.appendChild(tBody);	
			
			
			// FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
			var divContainer = document.getElementById("returnsTable");
			divContainer.innerHTML = "";
			divContainer.appendChild(table);
			
		}	
	}
 