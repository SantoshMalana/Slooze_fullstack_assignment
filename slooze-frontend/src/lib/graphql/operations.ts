import { gql } from '@apollo/client';

// ─── AUTH ────────────────────────────────────────────────────────

// Smart login: handles both demo users (direct) and registered users (OTP)
export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      requiresOtp
      accessToken
      user {
        id
        username
        email
        displayName
        role
        country
      }
      userId
      maskedEmail
      message
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($userId: String!, $otp: String!) {
    verifyOtp(userId: $userId, otp: $otp) {
      accessToken
      user {
        id
        username
        email
        displayName
        role
        country
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        username
        email
        displayName
        role
        country
      }
    }
  }
`;



// ─── RESTAURANTS ─────────────────────────────────────────────────
export const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      id
      name
      cuisine
      address
      country
      menuItems {
        id
        name
        description
        price
        category
        isAvailable
      }
    }
  }
`;

export const GET_MENU_ITEMS = gql`
  query GetMenuItems($restaurantId: ID!) {
    menuItems(restaurantId: $restaurantId) {
      id
      name
      description
      price
      category
      isAvailable
    }
  }
`;

// ─── ORDERS ──────────────────────────────────────────────────────
export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      status
      totalAmount
      createdAt
      updatedAt
      restaurant {
        id
        name
        cuisine
        country
      }
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
      payment {
        id
        lastFourDigits
        type
        cardholderName
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalAmount
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
        }
      }
    }
  }
`;

export const CHECKOUT_ORDER = gql`
  mutation CheckoutOrder($orderId: ID!, $paymentMethodId: ID!) {
    checkoutOrder(orderId: $orderId, paymentMethodId: $paymentMethodId) {
      id
      status
      totalAmount
      payment {
        id
        lastFourDigits
        type
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

// ─── PAYMENTS ────────────────────────────────────────────────────
export const GET_MY_PAYMENT_METHODS = gql`
  query GetMyPaymentMethods {
    myPaymentMethods {
      id
      type
      cardholderName
      lastFourDigits
      expiryMonth
      expiryYear
      isDefault
    }
  }
`;

export const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($input: AddPaymentMethodInput!) {
    addPaymentMethod(input: $input) {
      id
      type
      cardholderName
      lastFourDigits
      expiryMonth
      expiryYear
      isDefault
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id)
  }
`;
