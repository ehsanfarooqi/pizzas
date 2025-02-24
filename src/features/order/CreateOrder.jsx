import { useState } from "react";
import { useSelector } from "react-redux";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import store from "../../store";
import { createOrder } from "../../services/apiRestaurant";
import { formatCurrency } from "../../utils/helpers";
import { clearItem, getCart, getTotalCartPrice } from "../cart/cartSlice";
import Button from "../../ui/Button";
import EmptyCart from "../cart/EmptyCart";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formError = useActionData();

  const username = useSelector((state) => state.user.userName);
  const cart = useSelector(getCart);

  const totalCartPrice = useSelector(getTotalCartPrice);
  const priority = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priority;

  if (!cart.length) return <EmptyCart />;
  return (
    <div className="px-5 py-4">
      <h2 className="mb-4 font-semibold">Ready to order? Lets go!</h2>

      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow"
            type="text"
            name="customer"
            defaultValue={username}
            required
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />
            {formError?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-sm text-red-700">
                {formError.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              name="address"
              required
            />
          </div>
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            type="checkbox"
            name="priority"
            id="priority"
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label className="font-medium" htmlFor="priority">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />

          <Button type="primary" disabled={isSubmitting}>
            {isSubmitting
              ? "Order placed..."
              : `Order now from ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

// get data from form
export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // create new order Object
  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true",
  };

  const errors = {};
  if (!isValidPhone(order.phone))
    errors.phone =
      "Please give as your correct phone number. We might need it to contact you.";
  if (Object.keys(errors).length > 0) return errors;

  // if everythings is ok, Create new Order
  const newOrder = await createOrder(order);

  // Do NOT overuse
  store.dispatch(clearItem());

  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
