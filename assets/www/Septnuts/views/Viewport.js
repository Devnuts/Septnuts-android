Septnuts.views.Viewport = Ext.extend(Ext.Panel, {
	fullscreen: true
	,layout: 'card'
	,activeItem: 'routesPanel'
		
	,initComponent: function() {
		//put instances of cards into app.views namespace
		Ext.apply(Septnuts.views, {
			routesPanel: new Septnuts.views.RoutesPanel({
				itemId: 'routesPanel'
				,listeners: {
					scope: this
					,routeSelected: this.onRouteSelected
				}
			})
			,mapPanel: new Septnuts.views.MapPanel({
				itemId: 'mapPanel'
				,listeners: {
					scope: this
					,back: this.onMapBack
				}
			})
		});
		
		//put instances of cards into viewport
		Ext.apply(this, {
			items: [
				Septnuts.views.routesPanel
				,Septnuts.views.mapPanel
			]
		});
		Septnuts.views.Viewport.superclass.initComponent.apply(this, arguments);
	}

	,onRouteSelected: function(route) {
		
		this.setActiveItem('mapPanel');
		Septnuts.views.mapPanel.loadRoute(route);
		
	}
	
	,onMapBack: function() {
	
		this.setActiveItem('routesPanel');
	
	}


});