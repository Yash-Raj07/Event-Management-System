function OrderConfirmation({ order, onContinue }) {
  if (!order) {
    return null;
  }
  return (
    <div className="screen popup-screen">
      <div className="popup-title">PopUp</div>
      <div className="popup-subtitle">THANK YOU</div>
      <div className="popup-amount">Total Amount: Rs/- {order.total}</div>
      <div className="checkout-columns">
        <div className="checkout-column">
          <div className="info-row">Name: {order.name}</div>
          <div className="info-row">E-mail: {order.email}</div>
          <div className="info-row">Address: {order.address}</div>
          <div className="info-row">City: {order.city}</div>
        </div>
        <div className="checkout-column">
          <div className="info-row">Number: {order.phone}</div>
          <div className="info-row">
            Payment Method: {order.paymentMethod}
          </div>
          <div className="info-row">State: {order.state}</div>
          <div className="info-row">PinCode: {order.pinCode}</div>
        </div>
      </div>
      <div className="button-row">
        <button
          type="button"
          className="button primary"
          onClick={onContinue}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;
