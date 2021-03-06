(function($) {
    var monthsFull = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    
    var types = {
        "length": {
            "name": "Length",
            "suffix": "",
            "base": "meters",
            "systems": {
                "imperial": "feet",
                "metric": "meters"
            },
            "units": {
                "meters": {
                    "name": "Meters",
                    "suffix": "m",
                    "from": function(m) { return parseFloat(m); },
                    "to": function(m) { return parseFloat(m); }
                },
                "feet": {
                    "name": "Feet",
                    "suffix": "ft",
                    "from": function(ft) { return parseFloat(ft) * 0.3048; }, // unit -> base
                    "to": function(m) { return parseFloat(m) / 0.3048; }, // base -> unit
                }
            }
        },
        "temperature": {
            "name": "Temperature",
            "suffix": "°",
            "base": "celcius",
            "systems": {
                "imperial": "farenheit",
                "metric": "celcius"
            },
            "units": {
                "celcius": {
                    "name": "Celcius",
                    "inputType": "number",
                    "suffix": "C",
                    "from": function(c) { return parseFloat(c); }, // unit -> base
                    "to": function(c) { return parseFloat(c); } // base -> unit
                },
                "farenheit": {
                    "name": "Farenheit",
                    "inputType": "number",
                    "suffix": "F",
                    "from": function(f) { return (parseFloat(f) - 32) * (5.0/9.0); }, // unit -> base 
                    "to": function(c) { return (parseFloat(c) * (9.0/5.0)) + 32; }, // base -> unit
                },
                "kelvin": {
                    "name": "Kelvin",
                    "inputType": "number",
                    "suffix": "K",
                    "from": function(k) { return parseFloat(k) - 273.15; },
                    "to": function (c) { return parseFloat(c) + 273.15; }
                }
            }
        },
        "location": {
            "name": "Location",
            "suffix": "",
            "base": "degrees",
            "units": {
                "degrees": {
                    "name": "Degrees",
                    "inputType": "number",
                    "suffix": "°",
                    "from": function(d) { return parseFloat(d); }, // unit -> base
                    "to": function(d) { return parseFloat(d); } // base -> unit
                },
                "degMinSec": {
                    "name": "Deg Min Sec",
                    "inputType": "text",
                    "suffix": "",
                    "from": function(dm) {
                        var degrees = 0;
                        var minutes = 0;
                        var seconds = 0;

                        var negative = dm.substring(0, 1) == '-';

                        if (negative) dm = dm.substring(1);

                        var values = dm.split(' ');
                        for (var i = 0; i < values.length; i++) {
                            var valueStr = values[i];
                            
                            if (valueStr.trim() == '') continue;
                            
                            var valueNum = parseFloat(valueStr);

                            if (isNaN(valueNum)) continue;

                            var valueUnit = valueStr.substring(
                                valueNum.toString().length);

                            // ------

                            switch(valueUnit) {
                                case 'min':
                                case 'm':
                                case "'":
                                    minutes = valueNum;
                                    break;
                                case 'sec':
                                case 's':
                                case '"':
                                    seconds = valueNum;
                                    break;
                                case 'deg':
                                case 'd':
                                case '\xB0':
                                default:
                                    degrees = valueNum;
                                    break;
                            }
                        }

                        return (degrees + (minutes / 60) + (seconds / 3600)) * (negative ? -1 : 1);
                    },
                    "to": function(d) {
                        var negative = d < 0 ? '-' : '';
                        d = Math.abs(d);
                        var degrees = Math.floor(d);
                        var minutes = Math.floor((d - degrees) * 60);
                        var seconds = (d - degrees - (minutes / 60)) * 3600;
                        seconds = Math.round(seconds * 100) / 100; // restrict to 2 decimal places

                        var output = negative + degrees + '\xB0 '+ minutes + "' " + seconds + '"';
                        return output;
                    }
                },
                "degMin": {
                    "name": "Deg Min",
                    "inputType": "text",
                    "suffix": "",
                    "from": function(dm) {
                        var degrees = 0; 
                        var minutes = 0;
                        var seconds = 0;

                        var negative = dm.substring(0, 1) == '-';

                        if (negative) dm = dm.substring(1);

                        var values = dm.split(' ');
                        for (var i = 0; i < values.length; i++) {
                            var valueStr = values[i];
                            
                            if (valueStr.trim() == '') continue;
                            
                            var valueNum = parseFloat(valueStr);

                            if (isNaN(valueNum)) continue;

                            var valueUnit = valueStr.substring(
                                valueNum.toString().length);

                            // ------

                            switch(valueUnit) {
                                case 'min':
                                case 'm':
                                case "'":
                                    minutes = valueNum;
                                    break;
                                case 'sec':
                                case 's':
                                case '"':
                                    seconds = valueNum;
                                    break;
                                case 'deg':
                                case 'd':
                                case '\xB0':
                                default:
                                    degrees = valueNum;
                                    break;
                            }
                        }

                        return (degrees + (minutes / 60) + (seconds / 3600)) * (negative ? -1 : 1);
                    },
                    "to": function(d) {
                        var negative = d < 0 ? '-' : '';
                        d = Math.abs(d);
                        var degrees = Math.floor(d);
                        var minutes = Math.round((d - degrees) * 60 * 100) / 100; // restrict to 2 decimal places

                        var output = negative + degrees + '\xB0 '+ minutes + "'";
                        return output;
                    }
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
                    "from": function(u) { return parseInt(u); },
                    "to": function(u) { return parseInt(u); }
                },
                "iso": {
                    "name": "ISO Timestamp (Local)",
                    "inputType": "datetime-local",
                    "from": function(iso) { // unit (local) -> base (utc)
                        return (new Date(iso)).getTime();
                    },
                    "to": function(u) { // base (utc) -> unit (local)
                        var time = new Date(u);
                        var isoString = (
                            time.getFullYear() + '-' +
                            ('0' + (time.getMonth() + 1)).slice(-2) + '-' +
                            ('0' + time.getDate()).slice(-2) + 'T' +
                            ('0' + time.getHours()).slice(-2) + ':' +
                            ('0' + time.getMinutes()).slice(-2)
                        );
                        return isoString;
                    }
                },
                "human12hr": {
                    "name": "Human Readable (12HR, Local)",
                    "inputType": "text",
                    "from": function(hr) {
                        return (new Date(hr)).getTime();
                    },
                    "to": function(u) {
                        var time = new Date(u);
                       
                        var hour24 = time.getHours();
                        var ampm = hour24 >= 12 ? 'PM' : 'AM';

                        var hour12 = hour24 % 12;

                        var hrString = (
                            ('0' + hour12).slice(-2) + ':' +
                            ('0' + time.getMinutes()).slice(-2) + ':' +
                            ('0' + time.getSeconds()).slice(-2) + ' ' +
                            ampm + ', ' +
                            monthsFull[time.getMonth()] + ' ' +
                            time.getDate() + ', ' +
                            time.getFullYear()
                        );

                        return hrString;
                    }
                },
                "human24hr": {
                    "name": "Human Readable (24HR, Local)",
                    "inputType": "text",
                    "from": function(hr) {
                        return (new Date(hr)).getTime();
                    },
                    "to": function(u) {
                        var time = new Date(u);

                        var hrString = (
                            monthsFull[time.getMonth()] + ' ' +
                            time.getDate() + ', ' +
                            time.getFullYear() + ', ' +
                            ('0' + time.getHours()).slice(-2) + ':' +
                            ('0' + time.getMinutes()).slice(-2) + ':' +
                            ('0' + time.getSeconds()).slice(-2)
                        );

                        return hrString;
                    }
                }
            }
        },
        // "location": {}
    };

    function toBase(type, unit, val) {
        return types[type].units[unit].from(val);
    }

    function toUnit(type, unit, val) {
        return types[type].units[unit].to(val)
    }

    function convertUnit(type, unitIn, unitOut, val, round) {
        var base = toBase(type, unitIn, val);
        var result = toUnit(type, unitOut, base);
        if (round) {
            var roundMultiplier = Math.pow(10, round);
            result = Math.round(result * roundMultiplier) / roundMultiplier;
        }
        return result;
    }

    var suppressErrors = 0;

    function init(debug) {
        function debugLog(msg) {
            // if (debug) 
            console.log(msg);
        }

        // just makes things easier to read
        var $original = this;

        // -----

        // if the original already is normalized, skip (and return clone)
        if (typeof $original.data('unitnorm-clone') != 'undefined')
            return $original.data('unitnorm-clone');

        // if this is a clone, also skip
        if (typeof $original.data('unitnorm-original') != 'undefined')
            return;

        // -----

        // use val if an input, otherwise use text
        var valMethod = $original.is('input') ? 'val' : 'text';

        // 'unittype' is the type of value represented by the field
        // e.g. temperature, time, mass, etc.
        // see the 'types' variable above for a full list
        var unitType = $original.data('unittype');
        if (typeof unitType == 'undefined') {
            debugLog('unitnormalizer: data-unittype not defined.');
            if (suppressErrors < 1) {
                debugLog('unitnormalizer: Possible values are:')
                var typeKeys = Object.keys(types);
                for (var i = 0; i < typeKeys.length; i++) {
                    debugLog('unitnormalizer:    - ' + typeKeys[i]);
                }
            }
            return;
        }

        // 'unit' is the unit that all values will be converted to for the original field
        // if undefined, will be the base unit for that type (typically metric)
        var originalUnit = $original.data('unit') || types[unitType].base;
        // 'unitpref' is the default unit that the cloned field will be shown with
        // if undefined, defaults to 'unit'
        var unitPref = $original.data('unitpref') || originalUnit;
        // 'unitsavail' are the units that the user will be able to choose from
        // if undefined, defaults to just the preferred unit
        var unitsAvail = $original.data('unitsavail') || unitPref;
        unitsAvail = unitsAvail.split(',');

        // -----

        // clone the input
        var $clone = $original.clone();
        $original.data('unitnorm-clone', $clone);
        // give the clone a reference back to the original element
        // used for when the clone's value is changed
        $clone.data('unitnorm-original', $original);
        // remvove name so that the clone doesn't get submitted
        $clone.removeAttr('name');
        // also remove id from clone to avoid confusion (!!!!)
        $clone.removeAttr('id');
        // also remove value
        $clone.removeAttr('value');
        // remove unit attribute to avoid confusion
        // (unitPref represents clone's unit)
        $clone.removeAttr('data-unit');

        var cloneUnit = $clone.data('unitpref');
        if (cloneUnit && (valMethod == 'val')) {
            var newInputType = types[unitType].units[cloneUnit].inputType;
            if (newInputType) $clone.attr('type', newInputType);
        } 

        var unitType = $clone.data('unittype');
        var cloneUnitSystem = $clone.data('unitprefsystem');

        // if unit is specified via system, change unit to reflect that
        if (cloneUnitSystem) {
            cloneUnit = types[unitType].systems[cloneUnitSystem];
            $clone.data('unitpref', cloneUnit);
        }

        // -----
 
        // if the original field already has a value, make sure to convert it for the new field 
        var unitRound = parseInt($original.data('unitround'));

        $clone[valMethod](convertUnit(
            unitType,
            originalUnit,
            cloneUnit,
            $original[valMethod](),
            unitRound
        ));

        // fix min and max values on clone

        var originalMin = $original.attr('min');
        var originalMax = $original.attr('max');

        if (typeof originalMin != 'undefined')
            $clone.attr('min', convertUnit(
                unitType,
                originalUnit,
                cloneUnit,
                originalMin,
                unitRound
            ));

        if (typeof originalMax != 'undefined')
            $clone.attr('max', convertUnit(
                unitType,
                originalUnit,
                cloneUnit,
                originalMax,
                unitRound
            ));

        // -----

        // if input has a unit description, it needs to be changed
        var unitDesc = $original.attr('aria-describedby');
        if (typeof unitDesc != undefined) {
            var $desc = $('#' + unitDesc); 
            $original.data('unitnorm-descOriginal', $desc.text());
            var cloneUnitName = types[unitType].units[cloneUnit].name;
            $desc.text(cloneUnitName);
        }

        // -----

        // insert clone after original element
        $original.after($clone);
        // hide the original
        $original.hide();

        // here's where the ~M~A~G~I~C~ happens
        $clone.on('change.unitnorm', function(e, originOriginal) {
            if (originOriginal) return;

            // 'this' now represents the clone
            var $clone = $(this);
            var $original = $clone.data('unitnorm-original');

            var unitType = $clone.data('unittype');
            var cloneUnit = $clone.data('unitpref');

            var originalUnit = $original.data('unit');

            $original[valMethod](convertUnit(
                unitType,
                cloneUnit,
                originalUnit,
                $clone[valMethod]()
            )).trigger('change', true);
        });

        $original.on('change.unitnorm', function(e, originClone) {
            if (originClone) return;

            // 'this' now represents the original
            var $original = $(this);
            var $clone = $original.data('unitnorm-clone');

            var unitType = $clone.data('unittype');
            var cloneUnit = $clone.data('unitpref');
            var originalUnit = $original.data('unit');
            var unitRound = parseInt($original.data('unitround'));

            $clone[valMethod](convertUnit(
                unitType,
                originalUnit,
                cloneUnit,
                $original[valMethod](),
                unitRound
            )).trigger('change', true);
        });

        return true;
    }

    function deinit() {
        // just makes things easier to read
        var $this = this;

        // -----

        // if this is the original
        if (typeof $this.data('unitnorm-clone') != 'undefined') {
            $this.removeData('unitnorm-clone')
                .off('change.unitnorm')
                .show();

            // if input has a unit description, change it back
            var unitDesc = $this.attr('aria-describedby');
            if (typeof unitDesc != undefined) {
                var $desc = $('#' + unitDesc);
                $desc.text($this.data('unitnorm-descOriginal'));
                $this.removeData('unitnorm-descOriginal');
            }
        }

        // if this is a clone
        if (typeof $this.data('unitnorm-original') != 'undefined')
            $this.remove();
    }

    $.fn.unitnorm = function(action, debug) {
        // selectors for multiple elements are handled weirdly by jquery
        // have to iterate manually
        if (this.length > 1) {
            return this.each(function() {
                $(this).unitnorm(action, debug);
            });
        }

        switch(action) {
            case 'deinit':
                deinit.apply(this, debug);
                break;
            case 'init':
            default:
                init.apply(this, debug);
                break;
        }
    };
}(jQuery));
