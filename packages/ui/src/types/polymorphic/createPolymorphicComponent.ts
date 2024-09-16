type ExtendedProps<Props = object, OverrideProps = object> = OverrideProps &
  Omit<Props, keyof OverrideProps>

type ElementType =
  | keyof JSX.IntrinsicElements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | React.JSXElementConstructor<any>

type PropsOf<C extends ElementType> = JSX.LibraryManagedAttributes<
  C,
  React.ComponentPropsWithoutRef<C>
>

type ComponentProp<C> = {
  component?: C
}

type InheritedProps<C extends ElementType, Props = object> = ExtendedProps<
  PropsOf<C>,
  Props
>

export type PolymorphicRef<C> = C extends React.ElementType
  ? React.ComponentPropsWithRef<C>['ref']
  : never

export type PolymorphicComponentProps<
  C,
  Props = object,
> = C extends React.ElementType
  ? InheritedProps<C, Props & ComponentProp<C>> & {
      ref?: PolymorphicRef<C>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderRoot?: (props: any) => any
    }
  : Props & {
      component: React.ElementType
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderRoot?: (props: Record<string, any>) => any
    }

export function createPolymorphicComponent<
  ComponentDefaultType,
  Props,
  StaticComponents = Record<string, never>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(component: any) {
  type ComponentProps<C> = PolymorphicComponentProps<C, Props>

  type _PolymorphicComponent = <C = ComponentDefaultType>(
    props: ComponentProps<C>
  ) => React.ReactElement

  type ComponentProperties = Omit<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.FunctionComponent<ComponentProps<any>>,
    never
  >

  type PolymorphicComponent = _PolymorphicComponent &
    ComponentProperties &
    StaticComponents

  return component as PolymorphicComponent
}
