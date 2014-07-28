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


function urbanAreasGeo(cb){
	var sql="SELECT ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom) as geom, string_agg(zip.geoid10,',') as zip_codes FROM tl_2013_us_uac10 as ua ,tl_2013_us_zcta510 as zip where ST_Overlaps(ua.geom, zip.geom) and ua.name10 like '%NY%' group by  ua.geoid10, ua.name10, ua.namelsad10,ua.uatyp10, ST_ASGeoJSON(ua.geom)";
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
			feature.properties.name = row.name10;
			feature.properties.zip_codes = row.zip_codes;
			feature.geometry = JSON.parse(row.geom);
			geoJSON.features.push(feature);
			
		})
		return cb(geoJSON);
	});
}

module.exports = {
	
	home : function(req,res){
		
      	res.view();
		
	},
	urbanBusinessSum : function(req,res){
		var zip = req.param('zip');
		var naics = req.param('naics');
		var sql = "SELECT year,sum(case when empszes = '212' then estab else 0 end),  sum(case when empszes = '220' then estab else 0 end),  sum(case when empszes = '230' then estab else 0 end),  sum(case when empszes = '241' then estab else 0 end),  sum(case when empszes = '242' then estab else 0 end),  sum(case when empszes = '251' then estab else 0 end),  sum(case when empszes = '252' then estab else 0 end),  sum(case when empszes = '254' then estab else 0 end),  sum(case when empszes = '260' then estab else 0 end), FROM [zbp.zip_business_patterns] where zipcode in ("+zip+") and not empszes = '001' and NAICS2007 = '"+naics+"' group by year, order by year asc";
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
	}
};

