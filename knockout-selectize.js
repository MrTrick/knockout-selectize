/**
 * A simple knockout binding that integrates with knockout's select support.
 * Version: 0.1
 * License: MIT
 * Author: MrTrick
 */

ko.bindingHandlers.selectize = {
    init: function (el, value, bindings, vm, context) {
        var value = value();
        var params = _.defaults( 
            ko.unwrap(value), 
            {valueField:'value', labelField:'text'}
        );
        
        $(el).selectize(params);
        var selectize = el.selectize;
        
        //What options are being given?
        var options = bindings.get('options');
        
        //If the options are observable, synchronise add/remove events between selectize and knockout
        if (ko.isObservable(options)) {
            var changing = false;
            
            //Whenever an option is added/removed, copy to the observable. 
            selectize.on('option_add', function(value, data) { if (!changing) options.push(value); } );
            selectize.on('option_remove', function(value) { if (!changing) options.remove(value); } );
            
            //Whenever the observable has an element added/removed, copy to the options 
            options.subscribe(function(changes) {
                changing = true;
                changes.forEach(function(change) { 
                    if (change.status === 'added') {
                        selectize.addOption(_.object([params.valueField, params.labelField], [change.value, change.value]));
                    } else if (change.status === 'deleted') {
                        selectize.deleteOption(change.value);
                    }
                });
                changing = false;
            }, null, 'arrayChange');
        }
        
        //When the dom node is removed, ensure that the selectize node is too.
        ko.utils.domNodeDisposal.addDisposeCallback(el, function() { el.selectize.destroy(); });
    }    
};