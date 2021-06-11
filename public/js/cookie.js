function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function uploadCookie(cookieName, givenObject) {
    var now = new Date()
    now.setMonth(now.getMonth() + 1)
    document.cookie = `${cookieName} = ` + JSON.stringify(givenObject) + "; expires = " + now.toUTCString() + ";";
}

function removeCookie(cookieName) {
    // console.log('Script removing cookie running')
    // // document.cookie = cookieName + " = ; expires = Thu, 01-Jan-1970 00:00:01 GMT ;"

    // document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;"

    document.cookie = 'user' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

}

function getCookieObject(cookieName) {
    //tra ve object tu cookie
    const cookieData = getCookie(cookieName)//string
    if (cookieData) {
        const cookieObject = JSON.parse(cookieData)
        if (cookieObject) {
            return cookieObject
        }
    }
    return null
}