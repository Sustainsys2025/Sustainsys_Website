defineM(function ($, APP, TR) {
    'use strict';
    var usedRecaptcha = false,
        showRecaptchaBadge = false;
    function createIframe(id) {
        let path = APP.getAddonDir('formbuilder')+'/dist/',
            iframe =
                '<section class="formbuilder" style="position:fixed; height:100%; width:100%">' +
                // '   <iframe class="formbuilder-iframe" src="' + path + '/dist/index.html" width="100%" height="100%" align="left">' +
                '   <iframe class="formbuilder-iframe" width="100%" height="100%" align="left">' +
                '   </iframe>' +
                '   <div style="position: absolute;right: 92px;bottom: 23px;" type="button" title="' + TR('Cancel and Close') + '" data-tooltipster="top" class="btn btn-fab btn-raised btn-material-red tooltipstered formbuilder-close"><i class="mbr-icon-times"></i></div>' +
                '   <div style="position: absolute;right: 23px;bottom: 23px;" type="button" title="' + TR('Save and Close') + '" data-tooltipster="top" class="btn btn-fab btn-raised btn-primary tooltipstered formbuilder-apply"><i class="mbr-icon-check"></i></div>' +
                '</section>';

        let modal = APP.showDialog ({
            className: 'modal-fs',
            body: iframe,
            size:'fullscreen'
        });

        let component = APP.getComponentHTML(id);
        iframe = modal.find('.formbuilder-iframe')[0];

        let iframeHtml = '<!DOCTYPE html><html lang=en><head><meta charset=utf-8><meta http-equiv=X-UA-Compatible content="IE=edge"><meta name=viewport content="width=device-width,initial-scale=1"><link rel=icon href='+path+'../'+'favicon.ico><link rel=stylesheet href='+path+'./css/bootstrap.min.css><title>mbr-formbuilder</title><link href='+path+'css/app.css rel=preload as=style><link href='+path+'js/app.js rel=preload as=script><link href='+path+'js/chunk-vendors.js rel=preload as=script><link href='+path+'css/app.css rel=stylesheet></head><body><div id=app></div><script src='+path+'js/chunk-vendors.js></script><script src='+path+'js/app.js></script></body></html>'

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(iframeHtml);
        iframe.contentWindow.document.close();

        // waiting load iframe
        // if component not have [mbr-form] inputs or component is a custom form set form false
        // after this set theme type
        // after going to parse html
        // and stylise button
        $(iframe).on('load', function () {
            let form = component,
                themeType;
            if ($(component).find('[mbr-form] input, [mbr-form] textarea').length == 0 || $(component).is('.custom-form')) {
                form = false
            }
            if (APP.isAMP()) {
                themeType = "amp"
            }
            else {
                themeType = "mobirise4"
            };
            iframe.contentWindow.parseField(form, themeType);

            $(iframe.contentWindow.document).find('#recaptcha-how').click(function(e) {
                if ($(e.target).attr('data-address')) APP.openUrl($(e.target).attr('data-address'));
            });
            usedRecaptcha = $(iframe.contentWindow.window)[0].APP.$children[0].$children[1].formProps.recaptcha || false;

            $(iframe.contentWindow.document).find('#captcha-checkbox').change(function(e) {
                if ($(e.target).prop('checked')) {
                    usedRecaptcha = true;
                } else {
                    usedRecaptcha = false;
                }
            });

            $(iframe.contentWindow.document).find('#captcha-label').change(function(e) {
                var comp = APP.getComponent(id);

                var plugins = comp._plugins || '';

                if (plugins) {
                    plugins = plugins.split(',');
                    if ($(e.currentTarget).prop('checked')) {
                        $(plugins).each(function(i) {
                            if (this == 'formoid-css') plugins.splice(i,1);
                        })
                        APP.getComponent(id)._plugins = plugins.join(',');
                    } else {
                        plugins.push('formoid-css');
                        APP.getComponent(id)._plugins = plugins.join(',');
                    }
                }
            });
        });

        $('.formbuilder-close').tooltipster({
            content: $(this).attr('title'),
            delay: 0,
            speed: 100,
            position: $(this).attr('data-tooltipster') || $(this).attr('data-placement') || 'bottom'
        });
        $('.formbuilder-apply').tooltipster({
            content: $(this).attr('title'),
            delay: 0,
            speed: 100,
            position: $(this).attr('data-tooltipster') || $(this).attr('data-placement') || 'bottom'
        });

        function closeFormBuilder() {
            $('.modal-fs').remove()
        }

        $('.formbuilder-apply').click(function(e) {
            changeForm(iframe, id)
            closeFormBuilder()
        });

        $('.formbuilder-close').click(function(e) {
            closeFormBuilder()
        });
    }

    function changeToM5(formHtml) {
        if (APP.theme.params.theme.base) {
            const dragArea = formHtml.find('div.dragArea')
            const textMultipleformRows = formHtml.find('input.text-multiple').parent().parent()
            const rangeformRows = formHtml.find('input.form-range').parent().parent()
            const formCheck = formHtml.find('input.form-check-input').parent()
            
            formCheck.addClass('ms-2')
            dragArea.removeClass('form-row')
            dragArea.addClass('row')
            rangeformRows.removeClass('form-row')
            textMultipleformRows.removeClass('form-row')
        }
    }

    function changeForm(iframe, id) {
        // find inputs2 properties in vue
        let newForm = iframe.contentDocument,
            html = $(newForm).find('.workfield-inner').html()
        // get component
        let component = APP.getComponentHTML(id),
            sectionHTML = $('<div>'),
            $html = $(html),
            formOverlay = $(component).find('[mbr-form] .mbr-overlay');
        // remove remove-btn from form and some format html
        $html.find('.remove-btn').each(function () {
            $(this).remove()
        })

        // set data and time input value to html
        $html.find('[data-value]').each(function(){
            $(this).attr('value', $(this).attr('data-value'))
            $(this).removeAttr('data-value')
        })

        // modifies / removes classes for bootstrap5 themes 
        changeToM5($html)

        //remove hidden attr from message and set it to <template> (may work not corectly)
        if (APP.theme.params.theme.isAMP) {
            let success = $html.find('div[submit-success]').clone().html(),
                $success = $('<template data-form-alert="" type="amp-mustache">');

            $success.html(success)
            $html.find('div[submit-success]').empty()
            $html.find('div[submit-success]').append($success)

            let fail = $html.find('div[submit-error]').clone().html(),
                $fail = $('<template data-form-alert="" type="amp-mustache">');
            $fail.html(fail)
            $html.find('div[submit-error]').empty()
            $html.find('div[submit-error]').append($fail)

            $html.find('div[submit-success]').removeAttr('hidden')
            $html.find('div[submit-error]').removeAttr('hidden')

            $html.find('.form-group').removeClass('form-group').addClass('field')
            $html.find('.form-control').removeClass('form-control').addClass('field-input')
            $html.find('.row').removeClass('row').addClass('mbr-row')
            $html.find('.form-row').removeClass('form-row').addClass('mbr-form-row')
        }

        $html.find('[draggable]').removeAttr('draggable')
        $html.find('.selected').removeClass('selected')
        $html.find('.checked').removeClass('checked').attr('checked', 'checked')
        //change button to a on save form
        html = $html[1].outerHTML.replace(/(<!---->)/gm, '');
        html = html.replace(/></gm, '>\r<');
        html = html.replace(/<button/gm, '<a');
        html = html.replace(/<\/button>/gm, '<\/a>');
        html = html.replace(/\s{2,}/gm, ' ');

        //  if form have overlay "mbr-overlay" change only second container
        if (formOverlay.length !== 0) {
            html = '\r' + '<!--Formbuilder Form-->' + '\r' + $html[0].outerHTML + html + '<!--Formbuilder Form-->' + '\r';
        }
        else if (formOverlay.length === 0) {
            html = '\r' + '<!--Formbuilder Form-->' + '\r' + html + '<!--Formbuilder Form-->' + '\r';
        }

        // change and save curent form components html // or change formbuilder components
        sectionHTML.html(component);
        // remove component classes
        if ($(component).is('.custom-form')) {
            sectionHTML.find('.custom-form').addClass('form').removeClass('custom-form')
            sectionHTML.find('.component-form').addClass('mbr-form').removeClass('component-form')
        }
        sectionHTML.find('div[mbr-form]').html(html)

        component = sectionHTML.html();
        if (APP.isAMP()) {
            component = $(component).attr("plugins", "amp-main, amp-form, amp-mustache")[0].outerHTML
        } else {
            component = $(component).attr("plugins", "formstyler, datepicker")[0].outerHTML
        }

        //
        var newComponent = $(component).clone();
        var params = $(newComponent).find('mbr-parameters');

        if (params.find('[name="usedRecaptcha"]').length) {
            params.find('[name="usedRecaptcha"]').val(usedRecaptcha);
            component = newComponent[0].outerHTML
        } else {
            var hiddenInput = $('<input type="hidden" name="usedRecaptcha" value="'+usedRecaptcha+'">');
            params.append(hiddenInput);
            component = newComponent[0].outerHTML
        }
        //

        APP.setComponentHTML(id, component);
        APP.fire('formBuilderApply');
        sectionHTML.remove();
    }

    function unregisterPlugin(name) {
        for (var i = 0; i < APP.registeredPlugins.length; i++) {
            if (APP.registeredPlugins[i]['name'] === name) {
                APP.registeredPlugins.splice(i, 1);
            }
        }
    }

    APP.addAppResource(APP.getAddonDir("formbuilder")+'/formbuilder.css');

    APP.regExtension({
        name: 'formbuilder',
        filters: {
            allUsedPlugins: function(plugins) {
                unregisterPlugin('Formoid');
                return plugins;
            },
            allUsedPluginsForPage: function(plugins) {
                unregisterPlugin('Formoid');
                return plugins;
            }
        },
        events: {
            loadedComponent: function (component, page, context, publish) {
                if(!publish) {
                    context.find('.custom-form').on('click', function (e) {
                        var id = $(this).closest('.app-component').attr('data-app-component-id');
                        e.preventDefault();
                        e.stopPropagation();
                        createIframe(id)
                    });
                }
            },
            load: function () {
                // unregister Formoid plugin
                unregisterPlugin('Formoid');
            },
            formeditorOpen: function (modal, compID) {
                if (APP.getComponentHTML(compID)) {
                    let btn = "<button type=\"button\" class=\"btn btn-info form-editor-btn\">" + TR('Open in Form Builder') + "</button>";

                    modal.find('button').each(function () {
                        if ($(this).html() == 'Save') {
                            $(btn).insertBefore($(this))
                                .click(function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    createIframe(compID);
                                    modal.modal('hide')
                                })
                        }
                    });
                }
            }
        }
    });
}, ['jQuery', 'mbrApp', 'TR()']);

