from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    name: str = Field(..., min_length=1)
    role: str = Field("Staff", pattern="^(Admin|Manager|Staff)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(Admin|Manager|Staff)$")
    password: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class TokenRefreshRequest(BaseModel):
    refresh_token: str


# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    sku: str = Field(..., min_length=2, description="Unique SKU code")
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- CUSTOMER SCHEMAS ---
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- ORDER ITEM SCHEMAS ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


# --- ORDER SCHEMAS ---
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Pending|Processing|Shipped|Delivered|Cancelled)$")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    status: str
    total_amount: float
    order_date: datetime
    created_by_id: Optional[int] = None
    customer: CustomerResponse
    items: List[OrderItemResponse]
    created_by: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- INVENTORY TRANSACTION SCHEMAS ---
class InventoryTransactionCreate(BaseModel):
    product_id: int
    quantity: int
    type: str = Field(..., pattern="^(Stock In|Stock Out|Sale|Return)$")
    reference_id: Optional[int] = None

class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    type: str
    reference_id: Optional[int] = None
    created_at: datetime
    created_by_id: Optional[int] = None
    product: Optional[ProductResponse] = None
    created_by: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- ACTIVITY LOG SCHEMAS ---
class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- DASHBOARD METRICS AND CHARTS ---
class DashboardMetrics(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    revenue: float
    low_stock_count: int
    out_of_stock_count: int

class RevenueTrendItem(BaseModel):
    date: str
    revenue: float

class OrdersTrendItem(BaseModel):
    date: str
    count: int

class InventoryDistributionItem(BaseModel):
    name: str
    value: int

class DashboardData(BaseModel):
    metrics: DashboardMetrics
    revenue_trend: List[RevenueTrendItem]
    orders_trend: List[OrdersTrendItem]
    inventory_distribution: List[InventoryDistributionItem]
