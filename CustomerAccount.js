    console.log("tesste");  
    var jQuery = jQuery.noConflict();
    var postcode, telephone, taxvat, birthDay, birthMonth, birthYear;

    jQuery(function() {

        // Fields
        postcode = jQuery('[name*="postcode"]');
        telephone = jQuery('[name*="telephone"], [name*="fax"]');
        taxvat = jQuery('[name*="taxvatUI"]');
        birthDay = jQuery('[name*="day"]');
        birthMonth = jQuery('[name*="month"]');
        birthYear = jQuery('[name*="year"]');

        // Masks
        postcode.mask('99999-999');
        
        telephone.keypress(function() {

            var _this = jQuery(this);
            _this.mask(function() {
                return jQuery.trim(_this.val()).match(/^(\(?[1][1-9]\)? ?[9](5[0-9]|6[0-9]|7[01234569]|8[0-9]|9[0-9])[0-9]{1})/g) ? '(00) 00000-0000' : '(00) 0000-0000';
            });

        });

        birthDay.mask('99');
        birthMonth.mask('99');
        birthYear.mask('9999');

        function taxvatMask() {
            return jQuery.trim(taxvat.val()).length < 12 ? '999.999.999-99' : '99.999.999/9999-99';
        }

        taxvat
            .mask(taxvatMask)
            .on('focus', function() {

                try { jQuery(this).data('mask').remove(); }
                catch (e) { }

                jQuery(this).keyup(function() {

                    jQuery(this)
                        .val(jQuery(this).val().replace(/[^0-9]/g, ''))
                        .attr('maxlength', '14');

                });

            })
            .on('blur', function() {

                var _this = jQuery(this);
                try { _this.data('mask').remove(); }
                catch (e) { }

                _this
                    .parent()
                    .find('[name*="taxvat"][type="hidden"]')
                    .val(_this.val());

                _this.mask(taxvatMask);

            });

        // Address autocomplete
        postcode
            .not('[name="estimate_postcode"]')
            .on('keyup blur', function () {
            
                var _this = jQuery(this);
                var form = _this.closest('.form-list');
                var street1 = form.find('[name*="street"]').eq(0);
                var street2 = form.find('[name*="street"]').eq(1);
                var city = form.find('[name*="city"]');
                var region = form.find('[name*="region_id"]');

                if ((jQuery.trim(_this.val()).length == 9) && (jQuery.trim(_this.val()) != _this.data('data-postcode'))) {

                    _this.data('data-postcode', jQuery.trim(_this.val()));

                    jQuery.ajax({
                        url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fm.correios.com.br%2Fmovel%2FbuscaCepConfirma.do%3FcepEntrada%3D" + jQuery.trim(_this.val()).replace('-', '') + "%26metodo%3DbuscarCep%22%20and%20xpath%3D'%2F%2Fdiv%5Bcontains(%40class%2C%22caixacampobranco%22)%5D'&format=json&callback=",
                        beforeSend: function() {

                            postcode
                                .parent()
                                .find('.please-wait')
                                .show();

                            removeValidationAdvice(postcode);

                            street1
                                .attr('disabled', 'disabled')
                                .val('');

                            street2
                                .attr('disabled', 'disabled')
                                .val('');

                            city
                                .attr('disabled', 'disabled')
                                .val('');

                            region
                                .attr('disabled', 'disabled')
                                .children()
                                .first()
                                .prop('selected', 'selected');

                        },
                        success: function(data) {

                            var results = data.query.results;
                            var address = new Array();

                            if (results) {

                                for (var i = 0; i < results.div.span.length; i++) {
                                    address[results.div.span[i].content] = results.div.span[i + 1].content;
                                    i++;
                                }

                                var addressStreet1 = address['Logradouro:'];
                                var addressStreet2 = address['Bairro:'];
                                
                                // Set street
                                if (addressStreet1) {
                                    street1.val(addressStreet1);
                                    removeValidationAdvice(street1);
                                }

                                if (addressStreet2) {
                                    street2.val(addressStreet2);
                                    removeValidationAdvice(street2);
                                }

                                // Set city and region
                                var cityRegion = address['Localidade / UF:'].split(' /');
                                if (jQuery.trim(cityRegion[0])) {
                                    city.val(jQuery.trim(cityRegion[0]));
                                    removeValidationAdvice(city);
                                }

                                jQuery.each(regionJson.regions.BR, function(key, item) {

                                    if (item.code == jQuery.trim(cityRegion[1])) {
                                        
                                        region
                                            .children('option[value="' + key + '"]')
                                            .prop('selected', 'selected');

                                        removeValidationAdvice(region);

                                        return false;
                                    }

                                });


                            } else {

                                console.log('not found');
                                return false;

                            }

                        },
                        complete: function() {

                            postcode.parent().find('.please-wait').hide();
                            street1.removeAttr('disabled');
                            street2.removeAttr('disabled');
                            city.removeAttr('disabled');
                            region.removeAttr('disabled');

                        }
                    });

                }

        });

        jQuery('[name="shipping[same_as_billing]"]').on('click', function() {
            if (jQuery(this).is(':checked'))
                postcode.data('data-postcode', '');
        });

        // Validation

        Validation.add('validate-taxvat', 'Informe o CPF/CNPJ corretamente.', function(v) {
            return isTaxvat(taxvat.val());
        });

        Validation.add('validate-phone', 'Informe um nÃºmero vÃ¡lido.', function(v, el) {

            if (jQuery(el).is('[name*="telephone"]')) {
                return isPhone(v);
            } else {
                if (v.length > 0)
                    return isPhone(v);
                else
                    return true;
            }

        });

        Validation.add('validate-zip-international', 'Informe um CEP vÃ¡lido.', function(v) {
            return isPostcode(v);
        });

        function removeValidationAdvice(el) {
            el.removeClass('validation-failed');
            el.parent().find('.validation-advice').fadeOut('fast');
        }

    });

    function isTaxvat(val) {

        if (val.length == 14) {

            val = val.replace(/[^\d]+/g, '');
            if (val.length != 11)
                return false;

            for (var i = 0; i < 10; i++) {
                var valT = '';
                for (var j = 0; j < 11; j++)
                    valT = valT + i;
                if (val == valT)
                    return false;
            }

            add = 0;
            for (i = 0; i < 9; i++)
                add += parseInt(val.charAt(i)) * (10 - i);
            rev = 11 - (add % 11);
            if (rev == 10 || rev == 11)
                rev = 0;
            if (rev != parseInt(val.charAt(9)))
                return false;

            add = 0;
            for (i = 0; i < 10; i++)
                add += parseInt(val.charAt(i)) * (11 - i);
            rev = 11 - (add % 11);
            if (rev == 10 || rev == 11)
                rev = 0;
            if (rev != parseInt(val.charAt(10)))
                return false;

            return true;

        }
        
        else if (val.length == 18) {

            val = val.replace(/[^\d]+/g, '');

            for (var i = 0; i < 10; i++) {
                var valT = '';
                for (var j = 0; j < 11; j++)
                    valT = valT + i;
                if (val == valT)
                    return false;
            }

            tamanho = val.length - 2
            numeros = val.substring(0, tamanho);
            digitos = val.substring(tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;

            tamanho = tamanho + 1;
            numeros = val.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;

            return true;

        }
        
        else
            return false;

    }

    function isPhone(val) {

        var _match = val.match(/\(\d{2}\) \d{4,5}-\d{4}/);
        if (_match) {
            if (_match.length > 0)
                return true;
        }

        return false;

    }

    function isPostcode(val) {

        var _match = val.match(/\d{5}-\d{3}/);
        if (_match) {
            if (_match.length > 0)
                return true;
        }

        return false;

    }