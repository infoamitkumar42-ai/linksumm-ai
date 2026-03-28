from pydantic import BaseModel
from typing import Optional, List, Any

class SummarizeRequest(BaseModel):
    url: str
    user_id: Optional[str] = None

class SaveSummaryRequest(BaseModel):
    user_id: str
    source_url: str
    platform: str
    transcript: str
    summary: str
    word_count: int
    processing_time: float

class SavePublicSummaryRequest(BaseModel):
    summary: str
    transcript: str
    source_url: str
    platform: str
    word_count: int

# Monetization Models
class CheckQuotaRequest(BaseModel):
    user_id: str

class CheckQuotaResponse(BaseModel):
    can_summarize: bool
    remaining: int
    reason: str
    message: Optional[str] = None

class CreateSubscriptionRequest(BaseModel):
    user_id: str
    user_email: str
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None

class RazorpaySubscriptionResponse(BaseModel):
    subscription_id: str
    key_id: str
    amount: int

class PaypalSubscriptionResponse(BaseModel):
    approval_url: str
    plan_id: str

class ExecutePaypalSubscriptionRequest(BaseModel):
    token: str
    user_id: str

class ExecutePaypalSubscriptionResponse(BaseModel):
    success: bool
    message: str

class SubscriptionStatusResponse(BaseModel):
    is_premium: bool
    subscription_expires: Optional[str] = None
    days_remaining: Optional[int] = None
    payment_method: Optional[str] = None
    can_cancel: bool

class CancelSubscriptionRequest(BaseModel):
    user_id: str
    subscription_id: Optional[str] = None

class CancelSubscriptionResponse(BaseModel):
    success: bool
    message: str

class PlanFeature(BaseModel):
    name: str

class Plan(BaseModel):
    name: str
    price: float
    price_inr: Optional[float] = None
    price_usd: Optional[float] = None
    summaries_per_day: int | str
    features: List[str]

class PricingResponse(BaseModel):
    plans: List[Plan]
    billing_cycles: List[str]
