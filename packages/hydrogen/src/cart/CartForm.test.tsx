import {describe, expect, it, vi} from 'vitest';
import {render} from '@testing-library/react';
import {CartForm, getFormInput} from './CartForm';

function MockForm({
  children,
  ...restOfProps
}: {
  children: React.ReactNode;
  restOfProps: Record<string, unknown>;
}): JSX.Element {
  return (
    <form data-testid="form" {...restOfProps}>
      {children}
    </form>
  );
}

vi.mock('@remix-run/react', () => ({
  useFetcher: vi.fn().mockImplementation(() => {
    return {
      Form: MockForm,
    };
  }),
}));

function getRenderFormInput(container: HTMLElement) {
  return container
    .querySelector('input[name="cartFormInput"]')
    ?.getAttribute('value');
}

describe('<CartForm />', () => {
  it('renders a form with children', () => {
    const {container} = render(
      <CartForm action={CartForm.ACTIONS.LinesAdd} inputs={{lines: []}}>
        <button>Submit</button>
      </CartForm>,
    );

    expect(getRenderFormInput(container)).toBe(
      '{"action":"LinesAdd","lines":[]}',
    );
  });

  it('renders a form with render prop', () => {
    const {container} = render(
      <CartForm
        action={CartForm.ACTIONS.LinesAdd}
        inputs={{lines: [], test: 'test'}}
      >
        {(fetcher) => <button>Submit</button>}
      </CartForm>,
    );

    expect(getRenderFormInput(container)).toBe(
      '{"action":"LinesAdd","lines":[],"test":"test"}',
    );
  });

  it('renders a form with route', () => {
    const {container} = render(
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesAdd}
        inputs={{lines: []}}
      >
        <button>Submit</button>
      </CartForm>,
    );

    // console.log(container.innerHTML)
    expect(container.querySelector('form')?.getAttribute('action')).toBe(
      '/cart',
    );
  });

  it('has static properties', () => {
    expect(CartForm.INPUT_NAME).toBe('cartFormInput');
    expect(CartForm.ACTIONS).toEqual({
      AttributesUpdateInput: 'AttributesUpdateInput',
      BuyerIdentityUpdate: 'BuyerIdentityUpdate',
      Create: 'Create',
      DiscountCodesUpdate: 'DiscountCodesUpdate',
      LinesAdd: 'LinesAdd',
      LinesUpdate: 'LinesUpdate',
      LinesRemove: 'LinesRemove',
      NoteUpdate: 'NoteUpdate',
      SelectedDeliveryOptionsUpdate: 'SelectedDeliveryOptionsUpdate',
      MetafieldsSet: 'MetafieldsSet',
      MetafieldDelete: 'MetafieldDelete',
    });
  });
});

function mockFormData(data: Record<string, unknown>) {
  const formatData: any = {
    cartFormInput: JSON.stringify(data),
  };
  return {
    has: (key: string) => !!formatData[key],
    get: (key: string) => formatData[key],
  };
}

describe('getFormInput', () => {
  it('returns an object with action and inputs', () => {
    const result = getFormInput(
      mockFormData({
        action: 'CustomTest',
        test: 'test',
      }),
    );

    expect(result).toEqual({
      action: 'CustomTest',
      inputs: {
        test: 'test',
      },
    });
  });
});