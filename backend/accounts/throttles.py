from rest_framework.throttling import SimpleRateThrottle


class RegisterRateThrottle(SimpleRateThrottle):
    scope = 'auth_register'

    def get_cache_key(self, request, view):
        path = getattr(request, 'path', '') or ''
        if not path.endswith('/register/'):
            return None
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class LoginRateThrottle(SimpleRateThrottle):
    scope = 'auth_login'

    def get_cache_key(self, request, view):
        path = getattr(request, 'path', '') or ''
        if not path.endswith('/login/'):
            return None
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }
