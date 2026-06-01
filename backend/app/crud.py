from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import json

from . import models, schemas, auth

# --- ACTIVITY LOGGER HELPER ---
def create_activity_log(db: Session, user_id: int, action: str, details: str = None, ip_address: str = None):
    log_entry = models.ActivityLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address
    )
    db.add(log_entry)
    try:
        db.commit()
    except Exception:
        db.rollback()

# --- DATABASE SEEDING ---
def seed_default_users(db: Session):
    # Check if we already have users
    if db.query(models.User).count() > 0:
        return

    # Seed Admin (Pushpendra)
    admin_user = models.User(
        username="pushpendra",
        email="pushpendra@tracehub.com",
        name="Pushpendra",
        hashed_password=auth.get_password_hash("adminpassword123"),
        role="Admin"
    )
    db.add(admin_user)

    # Seed Manager
    manager_user = models.User(
        username="manager",
        email="manager@tracehub.com",
        name="Jane Manager",
        hashed_password=auth.get_password_hash("managerpassword123"),
        role="Manager"
    )
    db.add(manager_user)

    # Seed Staff
    staff_user = models.User(
        username="staff",
        email="staff@tracehub.com",
        name="John Staff",
        hashed_password=auth.get_password_hash("staffpassword123"),
        role="Staff"
    )
    db.add(staff_user)

    # Seed dummy products & customers for direct HR view
    dummy_products = [
        models.Product(sku="PROD-001", name="Wireless Headphones", description="Premium Noise Cancelling Headphones", price=199.99, quantity=50),
        models.Product(sku="PROD-002", name="Smartwatch v2", description="Waterproof smartwatch with ECG monitor", price=249.50, quantity=15),
        models.Product(sku="PROD-003", name="USB-C Charging Dock", description="Multi-port fast charging station", price=45.00, quantity=3), # Low stock
        models.Product(sku="PROD-004", name="Mechanical Keyboard", description="RGB Blue Switch Keyboard", price=89.99, quantity=0), # Out of stock
    ]
    for p in dummy_products:
        db.add(p)

    dummy_customers = [
        models.Customer(full_name="Alice Smith", email="alice@gmail.com", phone="+1-555-0199"),
        models.Customer(full_name="Bob Jones", email="bob@yahoo.com", phone="+1-555-0143"),
        models.Customer(full_name="Charlie Miller", email="charlie@outlook.com", phone="+1-555-0177"),
    ]
    for c in dummy_customers:
        db.add(c)

    db.commit()

    # Create initial inventory transactions for the dummy products
    db_products = db.query(models.Product).all()
    for dp in db_products:
        if dp.quantity > 0:
            tx = models.InventoryTransaction(
                product_id=dp.id,
                quantity=dp.quantity,
                type="Stock In",
                created_by_id=1
            )
            db.add(tx)
    db.commit()

# --- USERS CRUD (Admin Only) ---
def get_users(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.User)
    if search:
        query = query.filter(
            or_(
                models.User.username.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%"),
                models.User.name.ilike(f"%{search}%")
            )
        )
    return query.order_by(models.User.id.desc()).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, creator_id: int):
    # Check username & email
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_user = models.User(
        username=user.username,
        email=user.email,
        name=user.name,
        role=user.role,
        hashed_password=auth.get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    create_activity_log(db, creator_id, "Create User", f"Created user {user.username} with role {user.role}")
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate, updater_id: int):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check email conflict
    if user_update.email and user_update.email != db_user.email:
        if get_user_by_email(db, user_update.email):
            raise HTTPException(status_code=400, detail="Email already registered")
            
    for key, value in user_update.dict(exclude_unset=True).items():
        if key == "password":
            db_user.hashed_password = auth.get_password_hash(value)
        else:
            setattr(db_user, key, value)
            
    db.commit()
    db.refresh(db_user)
    create_activity_log(db, updater_id, "Update User", f"Updated details for user {db_user.username}")
    return db_user

def delete_user(db: Session, user_id: int, deleter_id: int):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.id == deleter_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    username = db_user.username
    db.delete(db_user)
    db.commit()
    create_activity_log(db, deleter_id, "Delete User", f"Deleted user {username}")
    return db_user


# --- PRODUCTS CRUD ---
def get_products(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Product)
    if search:
        query = query.filter(
            or_(
                models.Product.name.ilike(f"%{search}%"),
                models.Product.sku.ilike(f"%{search}%")
            )
        )
    return query.order_by(models.Product.id.desc()).offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def create_product(db: Session, product: schemas.ProductCreate, user_id: int):
    if get_product_by_sku(db, product.sku):
        raise HTTPException(status_code=400, detail=f"Product with SKU '{product.sku}' already exists.")
        
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Create Inventory Transaction
    if db_product.quantity > 0:
        tx = models.InventoryTransaction(
            product_id=db_product.id,
            quantity=db_product.quantity,
            type="Stock In",
            created_by_id=user_id
        )
        db.add(tx)
        db.commit()
        
    create_activity_log(db, user_id, "Create Product", f"Created product {product.name} (SKU: {product.sku}, Qty: {product.quantity})")
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate, user_id: int):
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if product_update.sku and product_update.sku != db_product.sku:
        if get_product_by_sku(db, product_update.sku):
            raise HTTPException(status_code=400, detail=f"SKU '{product_update.sku}' is already in use.")
            
    old_qty = db_product.quantity
    
    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    
    # Handle stock changes
    new_qty = db_product.quantity
    if old_qty != new_qty:
        qty_diff = new_qty - old_qty
        tx_type = "Stock In" if qty_diff > 0 else "Stock Out"
        tx = models.InventoryTransaction(
            product_id=db_product.id,
            quantity=qty_diff,
            type=tx_type,
            created_by_id=user_id
        )
        db.add(tx)
        db.commit()
        
    create_activity_log(db, user_id, "Update Product", f"Updated product {db_product.name} (SKU: {db_product.sku})")
    return db_product

def delete_product(db: Session, product_id: int, user_id: int):
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if there are orders linking to this product
    order_items_count = db.query(models.OrderItem).filter(models.OrderItem.product_id == product_id).count()
    if order_items_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product as it is referenced in existing orders. Consider updating its quantity to 0 instead."
        )
        
    name = db_product.name
    sku = db_product.sku
    db.delete(db_product)
    db.commit()
    create_activity_log(db, user_id, "Delete Product", f"Deleted product {name} (SKU: {sku})")
    return db_product


# --- CUSTOMERS CRUD ---
def get_customers(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            or_(
                models.Customer.full_name.ilike(f"%{search}%"),
                models.Customer.email.ilike(f"%{search}%"),
                models.Customer.phone.ilike(f"%{search}%")
            )
        )
    return query.order_by(models.Customer.id.desc()).offset(skip).limit(limit).all()

def get_customer_by_id(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def create_customer(db: Session, customer: schemas.CustomerCreate, user_id: int):
    if get_customer_by_email(db, customer.email):
        raise HTTPException(status_code=400, detail=f"Customer with email '{customer.email}' already exists.")
        
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    create_activity_log(db, user_id, "Create Customer", f"Created customer {customer.full_name}")
    return db_customer

def update_customer(db: Session, customer_id: int, customer_update: schemas.CustomerUpdate, user_id: int):
    db_customer = get_customer_by_id(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    if customer_update.email and customer_update.email != db_customer.email:
        if get_customer_by_email(db, customer_update.email):
            raise HTTPException(status_code=400, detail=f"Email '{customer_update.email}' is already in use.")
            
    for key, value in customer_update.dict(exclude_unset=True).items():
        setattr(db_customer, key, value)
        
    db.commit()
    db.refresh(db_customer)
    create_activity_log(db, user_id, "Update Customer", f"Updated customer {db_customer.full_name}")
    return db_customer

def delete_customer(db: Session, customer_id: int, user_id: int):
    db_customer = get_customer_by_id(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    name = db_customer.full_name
    db.delete(db_customer)
    db.commit()
    create_activity_log(db, user_id, "Delete Customer", f"Deleted customer {name}")
    return db_customer


# --- ORDERS CRUD & BUSINESS LOGIC ---
def get_orders(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Order)
    if search:
        query = query.join(models.Customer).filter(
            or_(
                models.Customer.full_name.ilike(f"%{search}%"),
                models.Order.status.ilike(f"%{search}%")
            )
        )
    return query.order_by(models.Order.id.desc()).offset(skip).limit(limit).all()

def get_order_by_id(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def create_order(db: Session, order: schemas.OrderCreate, user_id: int):
    # Verify Customer
    customer = get_customer_by_id(db, order.customer_id)
    if not customer:
        raise HTTPException(status_code=400, detail="Customer not found")

    try:
        total_amount = 0.0
        order_items = []
        transactions_to_create = []
        
        # Deduct inventory & collect details
        for item in order.items:
            # Row lock to prevent double booking
            product = db.query(models.Product).with_for_update().filter(models.Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
                
            # Quantity Validation
            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Needed: {item.quantity}, Available: {product.quantity}"
                )
                
            # Deduct Stock
            product.quantity -= item.quantity
            item_price = product.price
            total_amount += item_price * item.quantity
            
            # Setup order item
            db_item = models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=item_price
            )
            order_items.append(db_item)
            
            # Setup Transaction
            tx = models.InventoryTransaction(
                product_id=product.id,
                quantity=-item.quantity, # Deducted
                type="Sale",
                created_by_id=user_id
            )
            transactions_to_create.append(tx)
            
        # Create Main Order
        db_order = models.Order(
            customer_id=order.customer_id,
            status="Pending",
            total_amount=total_amount,
            created_by_id=user_id
        )
        db.add(db_order)
        db.flush() # Fetch Order ID
        
        # Link children & Add
        for oi in order_items:
            oi.order_id = db_order.id
            db.add(oi)
            
        for tx in transactions_to_create:
            tx.reference_id = db_order.id
            db.add(tx)
            
        db.commit()
        db.refresh(db_order)
        
        create_activity_log(db, user_id, "Create Order", f"Placed Order ID {db_order.id} for Customer {customer.full_name} ($ {total_amount:.2f})")
        return db_order
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal database error placing order: {str(e)}")

def update_order_status(db: Session, order_id: int, status_update: schemas.OrderStatusUpdate, user_id: int):
    db_order = get_order_by_id(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    old_status = db_order.status
    new_status = status_update.status
    
    if old_status == new_status:
        return db_order
        
    try:
        # Case: Cancel active order -> Restore inventory
        if new_status == "Cancelled" and old_status != "Cancelled":
            for item in db_order.items:
                product = db.query(models.Product).with_for_update().filter(models.Product.id == item.product_id).first()
                if product:
                    product.quantity += item.quantity
                    # Record Return Transaction
                    tx = models.InventoryTransaction(
                        product_id=product.id,
                        quantity=item.quantity,
                        type="Return",
                        reference_id=db_order.id,
                        created_by_id=user_id
                    )
                    db.add(tx)
                    
        # Case: Re-activating a previously Cancelled order -> Deduct inventory
        elif old_status == "Cancelled" and new_status != "Cancelled":
            for item in db_order.items:
                product = db.query(models.Product).with_for_update().filter(models.Product.id == item.product_id).first()
                if not product:
                    raise HTTPException(status_code=400, detail="Cannot restore order: product no longer exists")
                if product.quantity < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Cannot restore order: Insufficient stock for '{product.name}'. Needed: {item.quantity}, Available: {product.quantity}"
                    )
                product.quantity -= item.quantity
                # Record Sale Transaction
                tx = models.InventoryTransaction(
                    product_id=product.id,
                    quantity=-item.quantity,
                    type="Sale",
                    reference_id=db_order.id,
                    created_by_id=user_id
                )
                db.add(tx)
                
        db_order.status = new_status
        db.commit()
        db.refresh(db_order)
        create_activity_log(db, user_id, "Update Order Status", f"Updated Order ID {db_order.id} status from {old_status} to {new_status}")
        return db_order
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating order: {str(e)}")

def delete_order(db: Session, order_id: int, user_id: int):
    db_order = get_order_by_id(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Cancel the order to release inventory back to warehouse before deletion if active
    if db_order.status != "Cancelled":
        for item in db_order.items:
            product = db.query(models.Product).with_for_update().filter(models.Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity
                # Log restoring transaction
                tx = models.InventoryTransaction(
                    product_id=product.id,
                    quantity=item.quantity,
                    type="Return",
                    created_by_id=user_id
                )
                db.add(tx)
                
    db.delete(db_order)
    db.commit()
    create_activity_log(db, user_id, "Delete Order", f"Deleted Order ID {order_id} from database")
    return db_order


# --- INVENTORY & LOG HISTORY ---
def get_inventory_history(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.InventoryTransaction).order_by(models.InventoryTransaction.id.desc()).offset(skip).limit(limit).all()

def get_activity_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.id.desc()).offset(skip).limit(limit).all()


# --- DASHBOARD SERVICES ---
def get_dashboard_data(db: Session) -> schemas.DashboardData:
    # 1. Compute Metrics
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    
    # Revenue (Non-cancelled orders)
    revenue = db.query(func.sum(models.Order.total_amount)).filter(models.Order.status != "Cancelled").scalar() or 0.0
    
    # Stock states
    low_stock_count = db.query(models.Product).filter(models.Product.quantity > 0, models.Product.quantity <= 5).count()
    out_of_stock_count = db.query(models.Product).filter(models.Product.quantity == 0).count()
    
    metrics = schemas.DashboardMetrics(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        revenue=revenue,
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count
    )

    # 2. Charts Calculations (Recharts inputs)
    # 30-Day Revenue & Orders Trend
    revenue_trend = []
    orders_trend = []
    
    today = datetime.utcnow().date()
    for i in range(14, -1, -1):
        target_date = today - timedelta(days=i)
        target_datetime_start = datetime.combine(target_date, datetime.min.time())
        target_datetime_end = datetime.combine(target_date, datetime.max.time())
        
        # Calculate revenue for that day
        day_revenue = db.query(func.sum(models.Order.total_amount))\
            .filter(
                models.Order.status != "Cancelled",
                models.Order.order_date >= target_datetime_start,
                models.Order.order_date <= target_datetime_end
            ).scalar() or 0.0
            
        # Calculate count for that day
        day_order_count = db.query(models.Order)\
            .filter(
                models.Order.order_date >= target_datetime_start,
                models.Order.order_date <= target_datetime_end
            ).count()
            
        date_str = target_date.strftime("%b %d")
        revenue_trend.append(schemas.RevenueTrendItem(date=date_str, revenue=day_revenue))
        orders_trend.append(schemas.OrdersTrendItem(date=date_str, count=day_order_count))
        
    # If the trend arrays are entirely zeros, seed some mock data points for demonstration value to HR
    has_real_rev = sum(item.revenue for item in revenue_trend) > 0
    if not has_real_rev:
        mock_revs = [450, 680, 520, 940, 810, 1100, 980, 1420, 1300, 1550, 1190, 1680, 2040, 1850, revenue]
        mock_counts = [2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 5, 8, 9, 8, total_orders]
        for idx in range(15):
            revenue_trend[idx].revenue = float(mock_revs[idx])
            orders_trend[idx].count = int(mock_counts[idx])

    # Inventory Distribution (Products categorised into stock profiles)
    instock = db.query(models.Product).filter(models.Product.quantity > 5).count()
    lowstock = low_stock_count
    outstock = out_of_stock_count
    
    inventory_distribution = [
        schemas.InventoryDistributionItem(name="In Stock (>5)", value=instock),
        schemas.InventoryDistributionItem(name="Low Stock (1-5)", value=lowstock),
        schemas.InventoryDistributionItem(name="Out of Stock", value=outstock)
    ]
    
    return schemas.DashboardData(
        metrics=metrics,
        revenue_trend=revenue_trend,
        orders_trend=orders_trend,
        inventory_distribution=inventory_distribution
    )
