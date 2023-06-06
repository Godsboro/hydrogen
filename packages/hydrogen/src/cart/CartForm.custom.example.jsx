import {json} from '@remix-run/server-runtime';
import {CartForm__unstable as CartForm} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

export default function Cart() {
  return (
    <CartForm
      action="CustomEditInPlace"
      inputs={{
        addLines: [
          {
            merchandiseId: 'gid://shopify/Product/123456789',
            quantity: 1,
          },
        ],
        removeLines: ['gid://shopify/CartLine/123456789'],
      }}
    >
      <button>Green color swatch</button>
    </CartForm>
  );
}

export async function action({request, context}) {
  const {cart} = context;
  const headers = new Headers();

  const formData = await request.formData();
  const {action, inputs} = cart.getFormInput(formData);

  let status = 200;
  let result;

  if (action === 'CustomEditInPlace') {
    result = await cart.addLines(inputs.addLines);
    result = await cart.removeLines(inputs.removeLines);
  } else {
    invariant(false, `${action} cart action is not defined`);
  }

  cart.setCartId(result.cart.id, headers);

  return json(result, {status, headers});
}