(function($) {
    var types = {
        // "volume": {},
        "length": {
            "name": "Length",
            "suffix": "",
            "base": "meters",
            "units": {
                "meters": {
                    "name": "Meters",
                    "suffix": "m",
                    "from": function(m) { return m; },
                    "to": function(m) { return m; }
                },
                "feet": {
                    "name": "Feet",
                    "suffix": "ft",
                    "from": function(ft) { return ft * 0.3048; }, // unit -> base
                    "to": function(m) { return m / 0.3048; }, // base -> unit
                }
            }
        },
        "temperature": {
            "name": "Temperature",
            "suffix": "°",
            "base": "celcius",
            "units": {
                "celcius": {
                    "name": "Celcius",
                    "inputType": "number",
                    "suffix": "C",
                    "from": function(c) { return c; }, // unit -> base
                    "to": function(c) { return c; } // base -> unit
                },
                "farenheit": {
                    "name": "Farenheit",
                    "inputType": "number",
                    "suffix": "F",
                    "from": function(f) { return (f - 32) * (5.0/9.0); }, // unit -> base 
                    "to": function(c) { return (c * (9.0/5.0)) + 32; }, // base -> unit
                },
                "kelvin": {
                    "name": "Kelvin",
                    "inputType": "number",
                    "suffix": "K",
                    "from": function(k) { return k - 273.15; },
                    "to": function (c) { return c + 273.15; }
                }
            }
        },
        "time": {
            "name": "Time",
            "suffix": "",
            "base": "unix",
            "units": {
                "unix": {
                    "name": "Unix Timestamp (UTC)",
                    "inputType": "number",
                    "from": function(u) { return u; },
                    "to": function(u) { return u; }
                },
                "iso": {
                    "name": "ISO Timestamp (Local)",
                    "inputType": "datetime-local",
                    "from": function(iso) { // unit (local) -> base (utc)
                        return (new Date(iso)).getTime();
                    },
                    "to": function(u) { // base (utc) -> unit (local)
                        var isoString = (new Date(parseInt(u))).toISOString();
                        isoString = isoString.substring(0, isoString.length - 2);
                        return isoString;
                    }
                }
            }
        },
        // "location": {}
    }

    var suppressErrors = 0;

    $.fn.unitnorm = function() {
        // selectors for multiple elements are handled weirdly by jquery
        // have to iterate manually
        if (this.length > 1) {
            return this.each(function() {
                $(this).unitnorm();
            });
        }

        // -----

        // just makes things easier to read
        var $original = this;

        // -----

        // if the original already is normalized, skip
        if (typeof $original.data('unitclone') != 'undefined')
            return;

        // if this is a clone, also skip
        if (typeof $original.data('unitoriginal') != 'undefined')
            return;

        // -----

        // 'unittype' is the type of value represented by the field
        // e.g. temperature, time, mass, etc.
        // see the 'types' variable above for a full list
        var unitType = $original.data('unittype');
        if (typeof unitType == 'undefined') {
            console.log('unitnormalizer: data-unittype not defined.');
            if (suppressErrors < 1) {
                console.log('unitnormalizer: Possible values are:')
                var typeKeys = Object.keys(types);
                for (var i = 0; i < typeKeys.length; i++) {
                    console.log('unitnormalizer:    - ' + typeKeys[i]);
                }
            }
            return;
        }

        // 'unit' is the unit that all values will be converted to for the original field
        // if undefined, will be the base unit for that type (typically metric)
        var unit = $original.data('unit') || types[unitType].base;
        // 'unitpref' is the default unit that the cloned field will be shown with
        // if undefined, defaults to 'unit'
        var unitPref = $original.data('unitpref') || unit;
        // 'unitsavail' are the units that the user will be able to choose from
        // if undefined, defaults to just the preferred unit
        var unitsAvail = $original.data('unitsavail') || unitPref;
        unitsAvail = unitsAvail.split(',');

        // -----

        // clone the input
        var $clone = $original.clone();
        $original.data('unitclone', $clone)
        // give the clone a reference back to the original element
        // used for when the clone's value is changed
        $clone.data('unitoriginal', $original);
        // remvove name so that the clone doesn't get submitted
        $clone.removeAttr('name');
        // also remove id to avoid confusion (!!!!)
        $clone.removeAttr('id');
        // remove unit attribute to avoid confusion
        // (unitPref represents clone's unit)
        $clone.removeAttr('data-unit');

        var cloneUnit = $clone.data('unitpref');
        var newInputType = types[unitType].units[cloneUnit].inputType;
        if (newInputType) $clone.attr('type', newInputType);

        // -----

        // if the original field already has a value, make sure to convert it for the new field 
        var originalVal = $original.val();
        var originalValBase = types[unitType].units[unit].from(originalVal);
        var cloneVal = types[unitType].units[cloneUnit].to(originalValBase)
        $clone.val(cloneVal);  

        // -----

        // if input has a unit description, it needs to be changed
        var unitDesc = $clone.attr('aria-describedby');
        if (typeof unitDesc != undefined) {
            var cloneUnitName = types[unitType].units[cloneUnit].name;
            $('#' + unitDesc).text(cloneUnitName);
        }

        // -----

        // insert clone after original element
        $original.after($clone);
        // hide the original
        $original.hide();

        // here's where the ~M~A~G~I~C~ happens
        $clone.change(function(e) {
            // 'this' now represents the clone
            var $clone = $(this);
            var $original = $clone.data('unitoriginal');
            
            var unitType = $clone.data('unittype');

            var cloneUnit = $clone.data('unitpref');
            var cloneVal = $clone.val();

            var cloneValBase = types[unitType].units[cloneUnit].from(cloneVal); // unit -> base
 
            var originalUnit = $original.data('unit');
            var originalVal = types[unitType].units[originalUnit].to(cloneValBase);

            $original.val(originalVal).change();
        });
        return true;
    };
}(jQuery));