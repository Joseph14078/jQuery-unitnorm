(function($) {
    var types = {
        // 'length": {},
        // "volume": {},
        "temperature": {
            "name": "Temperature",
            "suffix": "°",
            "base": "celcius",
            "units": {
                "celcius": {
                    "name": "Celcius",
                    "suffix": "C",
                    "from": function(c) { return c; }, // unit -> base
                    "to": function(c) { return c; } // base -> unit
                },
                "farenheit": {
                    "name": "Farenheit",
                    "suffix": "F",
                    "from": function(f) { return (f - 32) * (5.0/9.0); }, // unit -> base 
                    "to": function(c) { return (c * (9.0/5.0)) + 32; }, // base -> unit
                },
                "kelvin": {
                    "name": "Kelvin",
                    "suffix": "K",
                    "from": function(k) { return k - 273.15; },
                    "to": function (c) { return c + 273.15; }
                }
            }
        },
        // "time": {},
        // "location": {}
    }

    var suppressErrors = 0;

    $.fn.unitnorm = function() {
        var $original = this;

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
            return false;
        }

        // 'unit' is the unit that all values will be converted to for the original field
        // if undefined, will be the base unit for that type (typically metric)
        var unit = $original.data('unit') || types[unitType].base;
        // 'unitpref' is the default unit that the cloned field will be shown with
        // if undefined, defaults to 'unit'
        var unitPref = $original.data('unitpref') || unit;
        // 'unitsavail' are the units that the user will be able to choose from
        // if undefined, defaults to just the preferred unit
        var unitsAvail = $original.data('unitsavail');
        if (typeof unitsAvail == 'undefined')
            unitsAvail = [unitPref];
        else
            unitsAvail = unitsAvail.split(',');

        // -----

        // clone the input
        var $clone = $original.clone();
        // give the clone a reference back to the original element
        // used for when the clone's value is changed
        $clone.data('unitoriginal', $original);
        // remvove name so that the clone doesn't get submitted
        $clone.removeAttr('name');
        $clone.removeAttr('id');
        // remove unit attribute to avoid confusion
        // (unitPref represents clone's unit)
        $clone.removeAttr('data-unit');
        // insert clone after original element
        $original.after($clone);
        // hide the original
        $original.hide();

        $clone.change(function(e) {
            // 'this' now represents the clone
            var $clone = $(this);
            var $original = $clone.data('unitoriginal');
            
            var type = $clone.data('unittype');

            var cloneUnit = $clone.data('unitpref');
            var cloneVal = $clone.val();

            var cloneValBase = types[type].units[cloneUnit].from(cloneVal); // unit -> base
 
            var originalUnit = $original.data('unit');
            var originalVal = types[type].units[originalUnit].to(cloneValBase);

            $original.val(originalVal).change();
        });

        return true;
    };

}(jQuery));