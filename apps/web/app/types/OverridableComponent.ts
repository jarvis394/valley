/**
 * Remove properties `K` from `T`.
 * Distributive for union types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never

export interface OverridableComponent<M extends OverridableTypeMap> {
  <C extends React.ElementType>(
    props: {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      component: C
    } & OverrideProps<M, C>
  ): JSX.Element | null
  (props: DefaultComponentProps<M>): JSX.Element | null
}

/**
 * Props if `component={Component}` is NOT used.
 */
export type DefaultComponentProps<M extends OverridableTypeMap> = BaseProps<M> &
  DistributiveOmit<
    React.ComponentPropsWithRef<M['defaultComponent']>,
    keyof BaseProps<M>
  >

/**
 * Props of the component if `component={Component}` is used.
 */
export type OverrideProps<
  M extends OverridableTypeMap,
  C extends React.ElementType,
> = BaseProps<M> &
  DistributiveOmit<React.ComponentPropsWithRef<C>, keyof BaseProps<M>>

export interface OverridableTypeMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
  defaultComponent: React.ElementType
}

/**
 * Props defined on the component.
 */
export type BaseProps<M extends OverridableTypeMap> = M['props']
