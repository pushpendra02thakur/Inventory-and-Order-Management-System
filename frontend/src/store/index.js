import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import customerReducer from './slices/customerSlice'
import orderReducer from './slices/orderSlice'
import dashboardReducer from './slices/dashboardSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    customers: customerReducer,
    orders: orderReducer,
    dashboard: dashboardReducer,
  },
})

export default store
