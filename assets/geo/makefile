GENERATED_FILES = \
	ny.json

all: $(GENERATED_FILES)

.PHONY: clean all

clean:
	rm -rf -- $(GENERATED_FILES) build

build/tl_2012_us_zcta510.zip:
	mkdir build
	curl -o $@ 'http://www2.census.gov/geo/tiger/TIGER2012/ZCTA5/$(notdir $@)'

build/zipcodes-unfiltered.shp: build/tl_2012_us_zcta510.zip
	rm -rf -- $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

# strip water tracts
build/zipcodes.shp: build/zipcodes-unfiltered.shp
	rm -f -- $@
	ogr2ogr -f 'ESRI Shapefile' -where 'SUBSTR(GEOID10,0,2) = "10" OR SUBSTR(GEOID10,0,2) = "11" OR SUBSTR(GEOID10,0,2) = "12" OR SUBSTR(GEOID10,0,2) = "13" OR SUBSTR(GEOID10,0,2) = "14"' $@ $<

ny.json: build/zipcodes.shp
	topojson \
		-o $@ \
		-p geoid=GEOID10,area=+ALAND \
		-q 900 \
		-- $(filter %.shp,$^)