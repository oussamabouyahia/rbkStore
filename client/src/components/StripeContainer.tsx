import React, { useState, useEffect } from "react";
import Stripe from "stripe";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios, { AxiosError } from "axios";

interface StripeContainerProps {
  amount: number;
  handlePurchase:()=>void;
}

const StripeContainer: React.FC<StripeContainerProps> = ({ amount ,handlePurchase}) => {
  const [paymentIntent, setPaymentIntent] =
    useState<Stripe.PaymentIntent | null>(null);
  const [paymentIntent2, setPaymentIntent2] =
    useState<Stripe.PaymentIntent | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => { 
    // Convert the amount to cents
    const amountInCents = amount * 100;
  
    // Make a request to your backend to create a new payment intent
    axios
      .post<{ paymentIntent: Stripe.PaymentIntent }>(
        "http://localhost:3000/create-payment-intent",
        {amount: amountInCents },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => setPaymentIntent(res.data.paymentIntent))
      .catch((error: AxiosError) => console.log(error));
  }, [amount]);

  useEffect(() => {
    // Set the second payment intent state variable to the value of the first payment intent
    if (paymentIntent) {
      setPaymentIntent2(paymentIntent);
    }
  }, [paymentIntent]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);

    // Confirm the payment intent with the client-side Stripe library
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      paymentIntent2?.client_secret,
      {
        payment_method: {
          card: elements!.getElement(CardElement),
        },
      }
    );

    if (error) {
      console.log(error);
      setProcessing(false);
    } else {
      console.log(paymentIntent);
      setProcessing(false);
       handlePurchase()
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={processing}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default StripeContainer;
