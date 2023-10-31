
// Doi tuong validator
function Validator(options) {

    // lay thang cha
    function getParent(element, selector) { 
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // ham thuc hien validate
    function validate(inputElement,rule) {
        //var errorElement = getParent(inputElement, '.form-group');
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // lay rules cua tung selector
        var rules = selectorRules[rule.selector];

        // lap qua tung rule && kiem tra
        // neu co loi thi dung viec kiem tra
        for(var i = 0 ; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox': 
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !!errorMessage;
    }

    //lay element cua form can validate
    var formElement = document.querySelector(options.form);
    if(formElement) {

        //khi submitform
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;
            // thuc hien lap qua tung rule va validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(isValid) {
                    isFormValid = false;
                }
            });

            if(isFormValid) {
                // truong hop submit voi javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        switch(input.type) {
                            case 'radio': 
                                if(input.matches(':checked')) {
                                   values[input.name] = input.value;
                                }
                                break;
                            case 'checkbox': 
                                if(input.matches(':checked')) {
                                    if(!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                }
                                else return values;
                                break;
                            case 'file': 
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    },{})
                    options.onSubmit(formValues);
                }
                // truong hop submit voi hanh vi mac dinh
                else {
                    formElement.submit();
                }
            }
        }

        // xu li lap qua moi rule va xu li lang nghe su kien 
        options.rules.forEach(function(rule){

            // luu lai moi rule cho moi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else { 
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                if(inputElement) {
                    // xu li truong hop blur khoi input
                    inputElement.onblur = function() {
                        validate(inputElement,rule);
                    }
    
                    // xu li moi khi nguoi dung nhap vao input
                    inputElement.oninput = function() {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);   
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                }
            })
        })
    }
}

// Dinh nghia cac rule
Validator.isRequired = function(selector,message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui long nhap day du nao!!'
        }
    }
}

Validator.isEmail = function(selector,message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Truong nay phai la email!!';
        }
    }
}

Validator.minLength = function(selector,min,message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message ||`Vui long nhap du do dai la ${min}`;
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Gia tri nhap vao khong khop!!';
        }
    }
}

// Mong muon cua chung ta
Validator({
    form: '#form-1',
    formGroupSelector : '.form-group',
    errorSelector:'.form-message',
    rules: [
        Validator.isRequired('#fullname','Vui long nhap ten day du nhe!'),
        Validator.isRequired('#email'),
        Validator.isEmail('#email'),
        Validator.minLength('#password',6),
        Validator.isRequired('#password_confirmation'),
        Validator.isRequired('input[name="gender"]'),
        Validator.isConfirmed('#password_confirmation', function(){
            return document.querySelector('#form-1 #password').value;
        },'Mat khau nhap lai khong chinh xac'),
        Validator.isRequired('#province')
    ],
    onSubmit: function(data) {
        console.log(data);
    }
})