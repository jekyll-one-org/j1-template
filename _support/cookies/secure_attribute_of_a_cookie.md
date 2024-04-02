What controls the Secure attribute of a cookie?

The Secure flag of a cookie is controlled by the web server that sends the
cookie to the user's browser. When the server sets the cookie, it can
include an instruction for the browser to only send that cookie over HTTPS
connections. This is done by adding the Secure attribute to the cookie header
in the HTTP response.

Here's a breakdown of how it works:

* Secure Flag Set by Server:
  When a web server wants to create a secure cookie, it includes the
  Secure attribute in the HTTP response header when sending the cookie
  to the browser.

* Browser Obeys Flag:
  The browser recognizes the Secure flag and stores the cookie with the
  instruction to only transmit it over HTTPS connections.

* Protection Against Man-in-the-Middle Attacks:
  Because the cookie is only sent over HTTPS, it's encrypted during
  transmission. This helps prevent unauthorized parties, like those in
  a man-in-the-middle attack, from intercepting the cookie data.

Important Points:

* Insecure sites (using HTTP) cannot set cookies with the Secure flag.

* The Secure flag only protects the cookie during transmission. It doesn't
  guarantee security once the cookie is stored on the user's device.

* For additional security, cookies containing sensitive information should
  also use the HttpOnly flag, which prevents them from being accessed by
  client-side scripts like JavaScript.

Overall:

The Secure attribute helps prevent unauthorized parties from intercepting
the cookie data, which could happen on an unencrypted connection over HTTP.
By only sending the cookie over HTTPS, the data is encrypted and protected
from eavesdropping.
