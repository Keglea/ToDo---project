// Variable Declaration

    const loginBtn = document.querySelector("#login");
    const registerBtn = document.querySelector("#register");
    const loginForm = document.querySelector(".login-form");
    const registerForm = document.querySelector(".register-form");

    const signin_btn = document.getElementById("_signIn");
    const signup_btn = document.getElementById("_signUp");

// all inputs
var signupName = document.getElementById('signupName');
var signupEmail = document.getElementById('signupEmail');
var signupPassword = document.getElementById('signupPassword');

var signinEmail = document.getElementById('username_login');
var signinPassword = document.getElementById('password_login');


//for check inputs is empty or not
function isInputsEmpty() {

    if (signupName.value == "" || signupEmail.value == "" || signupPassword.value == "") {
        return false;
    } else {
        return true;
    }
}

var signUpArray = [];
// check email
function isEmailExist() {
    for (var i = 0; i < signUpArray.length; i++) {
        if (signUpArray[i].email.toLowerCase() == signupEmail.value.toLowerCase()) {
            return false;
        }
    }
}

//^ ============= Sign Up ================
function signUp() {
    if (isInputsEmpty() == false) {
        alert("all Inputs are required");
        return false;
    }
    // to store all value as object
    var signUp = {
        name: signupName.value,
        email: signupEmail.value,
        password: signupPassword.value,
    }
    if (signUpArray.length == 0) {
        signUpArray.push(signUp)
        localStorage.setItem('users', JSON.stringify(signUpArray))
        alert("Email Exists");
        return true;
    }
    if (isEmailExist() == false) {
        alert("Email Already Exists");

    } else {
        signUpArray.push(signUp);
        localStorage.setItem('users', JSON.stringify(signUpArray));
        alert("Success");

    }


}

//^ ============= login ================
//to check wether inputs are empty or not
function isLoginEmpty() {

    if (signinPassword.value == "" || signinEmail.value == "") {
        return false;
    } else {
        return true;
    }
}

function login() {
    if (isLoginEmpty() == false) {
        alert("oh no, All Inputs are required");
        return false;
    }
    var password = signinPassword.value;
    var email = signinEmail.value;
    for (var i = 0; i < signUpArray.length; i++) {
        if (signUpArray[i].email.toLowerCase() == email.toLowerCase() && signUpArray[i].password.toLowerCase() == password.toLowerCase()) {
            localStorage.setItem('sessionUsername', signUpArray[i].name)
            if (isEmailExist) {
                window.location.assign("home.html");
            }
        } else {
            // document.getElementById('incorrect').innerHTML = '<span class="p-2 text-danger">incorrect email or password</span>'
            alert("incorrect email or password");
        }
    }

}
// Login button function
loginBtn.addEventListener('click', ()=>{
    loginBtn.style.backgroundColor = "#21264D";
    registerBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    //form position
    loginForm.style.left = "50%";
    registerForm.style.left = "-50%";
    //form opacity
    loginForm.style.opacity = 1;
    registerForm.style.opacity = 0;
    //col 1 border style
    document.querySelector(".col-1").style.borderRadius = "20px 20% 30% 20px"
})

// Register button function
registerBtn.addEventListener('click', ()=>{
    registerBtn.style.backgroundColor = "#21264D";
    loginBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    //form position
    loginForm.style.left = "150%";
    registerForm.style.left = "50%";
    //form opacity
    loginForm.style.opacity = 0;
    registerForm.style.opacity = 1;
    //col 1 border style
    document.querySelector(".col-1").style.borderRadius = "20px 30% 20% 20px"
})

// sign buttons
signin_btn.addEventListener('click', ()=>{
      login()
    })
signup_btn.addEventListener('click', ()=>{
    signUp()
    })


// // Home User
// const home = document.querySelector('#userID');
// let userName = localStorage.getItem('signupName');

// home.innerHTML = `<h2> ${userName}</h2>`