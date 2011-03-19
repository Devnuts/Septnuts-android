Septnuts.views.MapPanel = Ext.extend(Ext.Panel, {

	layout: 'fit'

	,initComponent: function() {


		// configure marker images
		this.markerImgs = {
			bus_yellow: new google.maps.MarkerImage(
				'img/BusThree.png'
				, new google.maps.Size(32, 32)
				, new google.maps.Point(0, 0)
				, new google.maps.Point(15, 31)
			)
			,bus_blue: new google.maps.MarkerImage(
				'img/BusTwo.png'
				, new google.maps.Size(32, 32)
				, new google.maps.Point(0, 0)
				, new google.maps.Point(15, 31)
			)
			,bus_red: new google.maps.MarkerImage(
				'img/BusOne.png'
				, new google.maps.Size(32, 32)
				, new google.maps.Point(0, 0)
				, new google.maps.Point(15, 31)
			)
		};


		// create map object
		this.map = new Ext.Map({
			styleHtmlContent: true
			,mapOptions: {
				center: new google.maps.LatLng(39.9529, -75.1602) //Philly
			}
			,listeners: {
				scope: this
				,maprender: this.onMapRender
			}
		});

		// create the bus info bubble
		this.busInfoWindow = new google.maps.InfoWindow();

		// populate panel docks
		this.dockedItems = [{
			dock: 'top'
			,itemId: 'mapToolbar'
			,xtype: 'toolbar'
			,title: 'Routes Map'
			,items: [{
				xtype: 'button'
				,ui: 'back'
				,text: 'Back'
				,scope: this
				,handler: function() {
					this.fireEvent('back');
				}
			},{
				xtype: 'spacer'
			},{
				iconMask: true
				,iconCls: 'refresh'
				,scope: this
				,handler: function() {
					this.loadBusData();
				}
			}]
		}];

		// populate panel items
		this.items = [this.map];


		// call parent initComponent
		Septnuts.views.MapPanel.superclass.initComponent.apply(this, arguments);
	}


	,loadRoute: function(route) {

		// store loaded route
		this.loadedRoute = route;

		// set the vocabulary, dependent on the type of route
		switch (route.get('RouteType')) {
			case 0:
				this.vehicleName = 'Trolley';
				this.vehiclesName = 'Trolleys';
				break;

			case 3:
				this.vehicleName = 'Bus';
				this.vehiclesName = 'Buses';
				break;

			default:
				this.vehicleName = 'Vehicle';
				this.vehiclesName = 'Vehicles';
				break;
		}

  		// set toolbar title
  		this.getDockedComponent('mapToolbar').setTitle('Route '+route.get('RouteShortName'));

  		// unload previous layer
  		if(this.routeLayer)
  		{
  			this.routeLayer.setMap(null);
  		}

  		// load layer for this route
		this.routeLayer = new google.maps.KmlLayer('http://www3.septa.org/transitview/kml/' + route.get('RouteShortName') +'.kml');
		this.routeLayer.setMap(this.map.map);

		// load bus data
		this.loadBusData();

	}

	,onMapRender: function(comp, map) {

		//console.info('map rendered');

	}


	,loadBusData: function() {

		// mask map during load
		this.getEl().mask('Locating ' + this.vehiclesName + '&hellip;', 'x-mask-loading');

		// fire JSONP request
		Ext.Ajax.request({
			url: 'http://septa.mobi/bus_route_data.php'
			,params: {
				route: this.loadedRoute.get('RouteShortName')
			}
			,scope: this
			,success: this.onBusData
		});

	}


	,onBusData: function(response) {

		var data = Ext.decode(response.responseText);

		// remove load mask
		this.getEl().unmask();

		// erase old markers
		if(this.busMarkers)
		{
			Ext.each(this.busMarkers, function(busMarker) {
				busMarker.setMap(null);
			});
		}

		// alert user if no buses found
		if(data.bus.length == 0)
		{
			Ext.Msg.alert('No ' + this.vehiclesName + ' found', 'No ' + this.vehiclesName + ' could be located on this route right now');
			return;
		}

		// create marker for each bus
		this.busMarkers = [];

		Ext.each(data.bus, function(busData) {

			// choose icon
			var icon = 'bus_yellow';
			switch(busData.Direction)
			{
				case 'WestBound':
				case 'SouthBound':
					icon = 'bus_red';
					break;

				case 'EastBound':
				case 'NorthBound':
					icon = 'bus_blue';
					break;

			}

			// create marker
			var busMarker = new google.maps.Marker({
				position: new google.maps.LatLng(busData.lat, busData.lng)
				,title: 'Some ' + this.vehiclesName
				,icon: this.markerImgs[icon]
			});

			busMarker.setMap(this.map.map);


			// attach the bus info bubble to the marker when clicked
			google.maps.event.addListener(busMarker, 'click', Ext.createDelegate(function() {

				this.busInfoWindow.close();

				this.busInfoWindow.setContent(
					this.vehicleName + ' ' + busData.label
					+ ' toward<br>' + (busData.destination != '' ? busData.destination : 'unknown desitnation')
					+ '<br>reported ' + (busData.Offset == '0' ? 'just now.' : busData.Offset + ' minutes ago')
				);

				this.busInfoWindow.open(this.map.map, busMarker);
			}, this));


			// add to list
			this.busMarkers.push(busMarker);

		}, this);

	}



});