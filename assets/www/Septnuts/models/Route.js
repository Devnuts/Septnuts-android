Septnuts.models.RoutesPanel = Ext.regModel('Route', {
	fields: [{
		name: 'RouteID'
		,type: 'integer'
	},{
		name: 'RouteShortName'
	},{
		name: 'RouteLongName'
	},{
		name: 'RouteType'
		,type: 'integer'
	},{
		name: 'RouteURL'
		,useNull: true
	}]
	
	,proxy: {
		type: 'ajax'
		,url: 'http://septa.mobi/data/routes.json'
		,reader: {
			type: 'json'
			,root: 'routes'
			,idProperty: 'RouteID'
		}
	}
});