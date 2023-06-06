import {useFetcher} from '@remix-run/react';
import {type ActionArgs, json} from '@remix-run/server-runtime';
import {
  type CartQueryData,
  type CartHandlerReturnBase,
  CartForm__unstable as CartForm,
  type CartActionInput,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import type {Cart} from '@shopify/hydrogen/storefront-api-types';

export function ThisIsGift({metafield}: {metafield: Cart['metafield']}) {
  const fetcher = useFetcher();

  const buildFormInput: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => CartActionInput = (event) => ({
    action: CartForm.ACTIONS.MetafieldsSet,
    inputs: {
      metafields: [
        {
          key: 'public.gift',
          type: 'boolean',
          value: event.target.checked.toString(),
        },
      ],
    },
  });

  return (
    <div>
      <input
        checked={metafield?.value === 'true'}
        type="checkbox"
        id="isGift"
        onChange={(event) => {
          fetcher.submit(
            {
              [CartForm.INPUT_NAME]: JSON.stringify(buildFormInput(event)),
            },
            {method: 'POST', action: '/cart'},
          );
        }}
      />
      <label htmlFor="isGift">This is a gift</label>
    </div>
  );
}

export async function action({request, context}: ActionArgs) {
  const cart = context.cart as CartHandlerReturnBase;
  // cart is type CartHandlerReturnBase or CartHandlerReturnCustom
  // Declare cart type in remix.env.d.ts for interface AppLoadContext to avoid type casting
  // const {cart} = context;
  const headers = new Headers();

  const formData = await request.formData();
  const {action, inputs} = cart.getFormInput(formData);

  let status = 200;
  let result: CartQueryData;

  if (action === CartForm.ACTIONS.MetafieldsSet) {
    result = await cart.setMetafields(inputs.metafields);
  } else {
    invariant(false, `${action} cart action is not defined`);
  }

  cart.setCartId(result.cart.id, headers);

  return json(result, {status, headers});
}