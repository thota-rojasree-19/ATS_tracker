from rest_framework.throttling import SimpleRateThrottle


class OTPRequestRateThrottle(SimpleRateThrottle):
    scope = 'otp_request'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        email = ''
        if hasattr(request, 'data') and isinstance(request.data, dict):
            email = str(request.data.get('email', '')).strip().lower()
        return self.cache_format % {
            'scope': self.scope,
            'ident': f'{ident}:{email}',
        }


class OTPVerifyRateThrottle(SimpleRateThrottle):
    scope = 'otp_verify'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        email = ''
        if hasattr(request, 'data') and isinstance(request.data, dict):
            email = str(request.data.get('email', '')).strip().lower()
        return self.cache_format % {
            'scope': self.scope,
            'ident': f'{ident}:{email}',
        }


class LoginRateThrottle(SimpleRateThrottle):
    scope = 'auth_login'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }
