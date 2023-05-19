import {
  createCartHandler_unstable as createCartHandler,
  cartGetIdDefault,
  cartLinesAddDefault,
  cartLinesRemoveDefault,
} from '@shopify/hydrogen';

const mutationOptions = {
  storefront,
  getCartId: cartGetIdDefault(request.headers),
};

const cart = createCartHandler({
  storefront,
  requestHeaders: request.headers,
  customMethods: {
    editInPlace: async (removeLineIds, addLines) => {
      // Using Hydrogen default cart query methods
      await cartLinesAddDefault(mutationOptions)(addLines);
      return await cartLinesRemoveDefault(mutationOptions)(removeLineIds);
    },
    addLines: async (lines, optionalParams) => {
      // With your own Storefront API graphql query
      return await storefront.mutate(CART_LINES_ADD_MUTATION, {
        variables: {
          id: optionalParams.cartId,
          lines,
        },
      });
    },
  },
});

// Usage custom method editInPlace that delete and add items in one method
cart.editInPlace(
  ['123'],
  [
    {
      merchandiseId: '456',
      quantity: 1,
    },
  ],
);

// Use overridden cart.addLines
const result = await cart.addLines(
  [
    {
      merchandiseId: '123',
      quantity: 1,
    },
  ],
  {
    cartId: 'c-123',
  },
);
// Output of result:
// {
//   cartLinesAdd: {
//     cart: {
//       id: 'c-123',
//       totalQuantity: 1
//     },
//     errors: []
//   }
// }

const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $country: CountryCode = ZZ
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      errors: userErrors {
        message
        field
        code
      }
    }
  }
`;
