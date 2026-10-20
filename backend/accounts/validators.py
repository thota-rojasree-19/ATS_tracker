import re
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email

LOCAL_PART_REGEX = re.compile(r'^[a-z0-9._+-]+$')


def get_allowed_email_domains() -> list[str]:
    raw = getattr(settings, 'ALLOWED_EMAIL_DOMAIN', 'earlyjobs.in,admin.com')
    if isinstance(raw, str):
        domains = [d.strip().lower() for d in raw.split(',') if d.strip()]
    elif isinstance(raw, (list, tuple, set)):
        domains = [str(d).strip().lower() for d in raw if str(d).strip()]
    else:
        domains = ['earlyjobs.in']
    if 'earlyjobs.in' not in domains:
        domains.append('earlyjobs.in')
    return domains


def get_allowed_email_domain() -> str:
    domains = get_allowed_email_domains()
    return domains[0] if domains else 'earlyjobs.in'


def normalize_email_address(email: str) -> str:
    if email is None or not isinstance(email, str):
        return ''
    return email.strip().lower()


def validate_company_email(value: str) -> str:
    """
    Normalize and strictly validate that an email address is a syntactically
    valid address belonging to an authorized company domain.
    Rejects lookalike domains, malformed addresses, multiple @ symbols, and non-ASCII tricks.
    """
    normalized = normalize_email_address(value)
    allowed_domains = get_allowed_email_domains()
    error_msg = f'Only valid @{" or @".join(allowed_domains)} company email addresses are allowed.'

    if not normalized:
        raise ValidationError('Email address is required.')

    # Reject any embedded whitespace, control chars, or display-name brackets
    if any(ch.isspace() or ord(ch) < 33 or ord(ch) > 126 for ch in normalized):
        raise ValidationError(error_msg)

    if '<' in normalized or '>' in normalized or '"' in normalized or "'" in normalized:
        raise ValidationError(error_msg)

    if normalized.count('@') != 1:
        raise ValidationError(error_msg)

    local_part, domain_part = normalized.rsplit('@', 1)

    if not local_part or len(local_part) > 64:
        raise ValidationError(error_msg)

    if local_part.startswith('.') or local_part.endswith('.') or '..' in local_part:
        raise ValidationError(error_msg)

    if not LOCAL_PART_REGEX.match(local_part):
        raise ValidationError(error_msg)

    # Exact domain match against allowed domains prevents subdomains and suffix/prefix lookalikes
    if domain_part not in allowed_domains:
        raise ValidationError(error_msg)

    # Run Django's standard validator as an additional check
    try:
        django_validate_email(normalized)
    except ValidationError as exc:
        raise ValidationError(error_msg) from exc

    return normalized
