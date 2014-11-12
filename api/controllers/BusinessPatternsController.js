/**
 * BusinessPatternsController
 *
 * @description :: Server-side logic for managing Businesspatterns
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var googleapis = require('googleapis');
var jwt = new googleapis.auth.JWT(
	'424930963222-s59k4k5usekp20guokt0e605i06psh0d@developer.gserviceaccount.com', 
	'availwim.pem', 
	'3d161a58ac3237c1a1f24fbdf6323385213f6afc', 
	['https://www.googleapis.com/auth/bigquery']
);
jwt.authorize();
var bigQuery = googleapis.bigquery('v2');




module.exports = {
	
	home : function(req,res){
		
      	res.view();
		
	},
	zipmap : function(req,res){
		
      	res.view();
	},
	zipData : function(req,res){

 		var sql = "SELECT year, zip, ap, emp, name FROM [zbp.zbp_totals] WHERE SUBSTR(zip, 1, 2) in ('10','11', '12', '13','14') GROUP BY year, zip, ap, emp, name ORDER BY year asc;";
 		var request = bigQuery.jobs.query({
	    	kind: "bigquery#queryRequest",
	    	projectId: 'avail-wim',
	    	timeoutMs: '30000',
	    	resource: {query:sql,projectId:'avail-wim'},
	    	auth: jwt
	    },
	    function(err, response) {
      		if (err) console.log('Error:',err);
      		
      		res.json({data:response})
	    });
	},
	zipGetNaics : function(req,res){
		var twoDNaics = req.param("twoDNaics"); //Gives this the first two digits of the Naics code to work with
		var sql = "SELECT naics FROM [zbp.zbp_details] where naics like '" + twoDNaics + "%' group by naics;";
		var request = bigQuery.jobs.query({
			kind:"bigquer@queryRequest",
			projectId: "avail-wim",
			timeoutMs: "30000",
			resource: {query:sql,projectId:"avail-wim"},
			auth: jwt
		},
		function(err, response) {
			if (err) console.log('Error:', err);

			res.json({data:response})
		});
	},
	zipNaicsData : function(req,res){ //given a naics 
		var naics = req.param("naics");
		var year = req.param("year");
		var sql = "SELECT zip, sum(b2)*2.5 + sum(b3)*7 + sum(b4)*14.5 + sum(b5)*34.5 + sum(b6)*79.5 + sum(b7)*174.5 + sum(b8)*374.5 + sum(b9)*749.5 + sum(b10)*13700 as numEmployees FROM [zbp.zbp_details] where year = '"+year+"' and naics = '"+naics+"' group by zip order by zip;";
		var request = bigQuery.jobs.query({
			kind: "bigquer@queryRequest",
			projectId: "avail-wim",
			timeoutMs: "30000",
			resource: {query:sql,projectId:"avail-wim"},
			auth: jwt
		}, 
		function(err, response) {
			if (err) console.log('Error:', err);

			res.json({data:response})
		});
	},
	urbanAreas : function(req,res){
		
		
      	res.view();
	},
	urbanBusinessSum : function(req,res){
		var zip = req.param('zip');
		var naics = req.param('naics');
		var sql = "SELECT year,sum(b2),sum(b3),sum(b4),sum(b5),sum(b6),sum(b7),sum(b8),sum(b9),sum(b10), FROM [zbp.zbp_details] where zip in ("+zip+")and naics like '"+naics+"%' group by year, order by year asc";
		var request = bigQuery.jobs.query({
	    	kind: "bigquery#queryRequest",
	    	projectId: 'avail-wim',
	    	timeoutMs: '30000',
	    	resource: {query:sql,projectId:'avail-wim'},
	    	auth: jwt
	    },
	    function(err, response) {
      		if (err) console.log('Error:',err);
      		
      		res.json({data:response})
	    });
	},
	zbpTotalEmployees : function(req,res){
		var zip = req.param('zip');
		var sql = "SELECT year,sum(emp),sum(qp1),sum(ap) FROM [zbp.zbp_totals] where zip in ("+zip+") group by year, order by year asc";
		var request = bigQuery.jobs.query({
	    	kind: "bigquery#queryRequest",
	    	projectId: 'avail-wim',
	    	timeoutMs: '30000',
	    	resource: {query:sql,projectId:'avail-wim'},
	    	auth: jwt
	    },
	    function(err, response) {
      		if (err) console.log('Error:',err);
      		
      		res.json({data:response})
	    });
	},
	urbanAreasEmployment : function(req,res){
		var sql = req.param('sql');
		var request = bigQuery.jobs.query({
	    	kind: "bigquery#queryRequest",
	    	projectId: 'avail-wim',
	    	timeoutMs: '30000',
	    	resource: {query:sql,projectId:'avail-wim'},
	    	auth: jwt
	    },
	    function(err, response) {
      		if (err) console.log('Error:',err);
      		
      		res.json({data:response})
	    });
	},
	urbanAreasGeo : function(req,res){
		//var sql="SELECT ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom) as geom, string_agg(zip.geoid10,',') as zip_codes FROM tl_2013_us_uac10 as ua ,tl_2013_us_zcta510 as zip where ST_Overlaps(ua.geom, zip.geom) and ua.name10 like '%NY%' group by  ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom)";
		var sql = "SELECT geoid10, aland10, ST_ASGeoJSON(geom) as geom FROM tl_2013_us_zcta510"
		Geocensus.query(sql,{},function(err,data){
			var geoJSON = {};
			geoJSON.type = "FeatureCollection";
			geoJSON.features = [];
			data.rows.forEach(function(row,index){
				var feature = {};
				feature.type ="Feature";
				feature.properties = {};
				feature.properties.id = index;
				feature.properties.geoid = row.geoid10;
				feature.properties.name = row.aland10;
				feature.geometry = JSON.parse(row.geom);
				geoJSON.features.push(feature);
				
			})
			res.json(geoJSON);
		});
	}
};

