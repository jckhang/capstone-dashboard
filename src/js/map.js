var areaPieData = [
  { label: "LotArea", value: 400080},
  { label: "BldgArea", value: 575000},
  { label: "ComArea", value: 0},
  { label: "ResArea", value: 575000},
  { label: "OfficeArea", value: 0},
  { label: "RetailArea", value: 1796},
  { label: "GarageArea", value: 0},
  { label: "StrgeArea", value: 0},
  { label: "FactryArea", value: 0},
  { label: "OtherArea", value: 0}
]

var farPieData = [
  { label: "BuiltFAR", value: 1.44 },
  { label: "ResidFAR", value: 3.44 },
  { label: "CommFAR", value: 0 },
  { label: "FacilFAR", value: 6.5 }     
]
var BBLUrl = "https://taxi-capstone.herokuapp.com/api/bbl/"
var land = ['One &Two Family Buildings', 'Multi-Family Walk-Up Buildings', 'Multi-Family Elevator Buildings', 'Mixed Residential & Commercial Buildings', 'Commercial & Office Buildings', 'Industrial & Manufacturing', 'Transportation & Utility', 'Public Facilities & Institutions', 'Open Space & Outdoor Recreation', 'Parking Facilities', 'Vacant Land']
window.onload = function() {
  var vizjson_url = 'https://jckhang.carto.com/api/v2/viz/1cd70cac-5200-11e6-8044-0ee66e2c9693/viz.json'; // <-- Paste viz.json URL between quotes
  var option = {
  	center: [40.7729338,-73.920572],
  	zoom: 12
  }
  var vis = cartodb.createVis('map', vizjson_url, option)
  .done(function(vis, layers) {
    map = vis.getNativeMap();
    var subLayer = layers[1].getSubLayer(0);
	  subLayer.setInteraction(true);
    subLayer.on('featureClick', function(e, latlng, pos, data, subLayerIndex) {
      var cartodbId = data.cartodb_id;
      $('#BBL-detail').removeClass('override')
      $('#BBL-weekend').removeClass('override')
      $('#BBL-weekday').removeClass('override')
      var sql = new cartodb.SQL({ user: 'jckhang' });
      sql.execute('SELECT * FROM overallbucketing_manhaten where cartodb_id='+cartodbId)
      .done(function (data) {
        bbl = data.rows[0].bbl_number;
        $.ajax({
          type: 'GET',
          url: BBLUrl+bbl, 
          dataType: "json",
          success: function(data){
            console.log(data.bbl, data.LandUse, land[data.LandUse-1])
            document.getElementById("landUse").innerHTML = land[data.LandUse-1]
            var weekday = data.Weekday.map(function(num){return num.toFixed(4)});
            weekday.unshift('Weekday');
            var weekdayBar = c3.generate({
              bindto: '#bar-weekday',
              data: {
                x: 'x',
                columns: [
                  ['x', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'],
                  weekday,
                ],
                type: 'bar'
              },
              bar: {
                width: {
                  ratio: 0.5 // this makes bar width 50% of length between ticks
                }
              },
              axis : {
                x : {
                  type: 'category',
                  categories: ['01:00', '09:00', '17:00', '24:00'],
                  tick: {
                    multiline:false,
                    culling: {
                      max: 4 // the number of tick texts will be adjusted to less than this value
                    }
                  }
                }
              }
            });
            weekdayBar.resize({height:200, width:300})
          
            var weekend = data.Weekend.map(function(num){return num.toFixed(4)});
            weekend.unshift('Weekend');

            var weekendBar = c3.generate({
              bindto: '#bar-weekend',
              data: {
                x: 'x',
                columns: [
                  ['x', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'],
                  weekend
                ],
                type: 'bar'
              },
              bar: {
                width: {
                  ratio: 0.5 // this makes bar width 50% of length between ticks
                }
              },
              axis : {
                x : {
                  type: 'category',
                  // categories: ['01:00', '09:00', '17:00', '24:00'],
                  tick: {
                    multiline:false,
                    culling: {
                      max: 4 // the number of tick texts will be adjusted to less than this value
                    }
                  }
                }
              }
            });
            weekendBar.resize({height:200, width:300})
            areaPie.updateProp("data.content", data.areaPieData)
            farPie.updateProp("data.content", data.farPieData)
          }
        })
      });
    });
  })

  .error(function(err) {
    console.log("An error occurred: " + err);
  });

  var areaPie = new d3pie("areaPie", {
  	header: {
	    title: {
	      text: "Area Composition",
	      fontSize: 10
	    },
	    location: "pie-center"
	  },
	  labels: {
	  	percentage: {
	  		color: '#000000',
	  		fontSize: 8
	  	}
	  },
  	size: {
    	canvasHeight: 200,
    	canvasWidth: 300,
    	pieInnerRadius: "70%"
  	},
		data: {
			content: areaPieData
		}
	});
	var farPie = new d3pie("farPie", {
		header: {
	    title: {
	      text: "FAR Composition",
	      fontSize: 10
	    },
	    location: "pie-center"
	  },
	  labels: {
	  	percentage: {
	  		color: '#000000',
	  		fontSize: 8
	  	}
	  },
  	size: {
    	canvasHeight: 200,
    	canvasWidth: 300,
    	pieInnerRadius: "70%"
  	},
		data: {
			content: farPieData
		}
	});

	var scrollY
	var winHeight = $(window).innerHeight()
	$('#BBL-detail').css({"height": "500px"})
	$('#BBL-weekend').css({"height": `${(winHeight-500-80)/2}px`})
	$('#BBL-weekday').css({"height": `${(winHeight-500-80)/2}px`})
	$('#placeholder2').css({"height":"600px"})
	$('#placeholder1').css({"height":"0px"})

	$('.detail').scroll(function(){
		scrollY = $('.detail').scrollTop()
		$('#placeholder2').css({"height": `${600-scrollY}px`})
		$('#placeholder1').css({"height": `${scrollY}px`})
		if(scrollY>200){
			$('#BBL-weekend').css({"height": `${(winHeight-50-80)/2}`})
			$('#BBL-weekday').css({"height": `${(winHeight-50-80)/2}`})
			$('#BBL-detail').css({"height": "50px"})
		}
		if(scrollY<200){
			$('#BBL-detail').css({"height": "500px"})
			$('#BBL-weekend').css({"height": `${(winHeight-500-80)/2}px`})
			$('#BBL-weekday').css({"height": `${(winHeight-500-80)/2}px`})
		}
	})
}
