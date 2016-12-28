import { Component, Children } from 'react'
import * as ReactDOM from 'react-dom'
import * as Tether from 'tether'

// Inspired by https://github.com/souporserious/react-tether

type Side = 'top' | 'bottom' | 'left' | 'right'

type attachmentPositions =
  'auto auto' |
  'top left' |
  'top center' |
  'top right' |
  'middle left' |
  'middle center' |
  'middle right' |
  'bottom left' |
  'bottom center' |
  'bottom right'

type RenderElementTo = string | {
  appendChild: Function,
}

interface Constraint {
  attachment?: 'element' | 'target' | 'both' | 'together' | 'none'
  pin?: boolean | Side[]
  to: 'scrollParent' | 'window' | HTMLElement | [number, number, number, number]
}

interface TetherProps {
  attachment: attachmentPositions
  renderElementTag?: string
  renderElementTo?: RenderElementTo

  targetAttachement?: attachmentPositions
  offset?: string
  targetOffset?: string
  targetModifier?: string
  enabled?: boolean
  classes?: {}
  classPrefix?: string
  optimizations?: {}
  constraints?: Constraint[]
  id?: string
  className?: string
  style?: {[key: number]: string}
  onUpdate?: Function
  onRepositioned?: Function
}

class TetherComponent extends Component<TetherProps, void> {

  public static defaultProps = {
    renderElementTag: 'div',
    renderElementTo: null,
  }

  public tether?: Tether = undefined
  private targetNode?: HTMLElement = undefined
  private elementParentNode?: HTMLElement = undefined

  public render() {
    return Children.toArray(this.props.children)[0] as React.ReactElement<any>
  }

  public componentDidMount() {
    this.targetNode = ReactDOM.findDOMNode<HTMLElement>(this as React.ReactInstance)
    this.update()
    this.registerEventListeners()
  }

  public componentDidUpdate(_prevProps: TetherProps) {
    this.update()
  }

  public componentWillUnmount() {
    this.destroy()
  }

  private registerEventListeners() {
    if (this.props.onUpdate && this.tether != null) {
      this.tether.on('update', this.props.onUpdate)
    }
    if (this.props.onRepositioned && this.tether != null) {
      this.tether.on('repositioned', this.props.onRepositioned)
    }
  }

  get renderNode() {
    const { renderElementTo } = this.props
    if (typeof renderElementTo === 'string') {
      return document.querySelector(renderElementTo) as Element
    } else {
      return renderElementTo || document.body
    }
  }

  private destroy() {
    const pn = this.elementParentNode
    if (pn != null) {
      ReactDOM.unmountComponentAtNode(pn)
      const pnpn = pn.parentNode as Node
      pnpn.removeChild(pn)
    }

    if (this.tether) {
      this.tether.destroy()
    }

    this.elementParentNode = undefined
    this.tether = undefined
  }

  private update() {
    const { children, renderElementTag } = this.props
    const elementComponent = Children.toArray(children)[1] as React.ReactElement<any> | undefined

    // if no element component provided, bail out
    if (elementComponent == null) {
      // destroy Tether element if it has been created
      if (this.tether) {
        this.destroy()
      }
      return
    }

    // create element node container if it hasn't been yet
    if (this.elementParentNode == null) {
      // create a node that we can stick our content Component in
      this.elementParentNode = document.createElement(renderElementTag!)

      // append node to the render node
      this.renderNode.appendChild(this.elementParentNode)
    }

    // render element component into the DOM
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this, elementComponent, this.elementParentNode, () => {
        // don't update Tether until the subtree has finished rendering
        this.updateTether()
      },
    )
  }

  private updateTether() {
    const { id, className, style, ...options } = this.props
    const tetherOptions = {
      target: this.targetNode,
      element: this.elementParentNode,
      ...options,
    }

    const pn = this.elementParentNode
    if (pn) {
      if (id) {
        pn.id = id
      }

      if (className) {
        pn.className = className
      }

      if (style) {
        Object.keys(style).forEach((key: string) => {
          pn.style[+key] = style[+key]
        })
      }
    }

    if (this.tether == null) {
      this.tether = new Tether(tetherOptions)
    } else {
      this.tether.setOptions(tetherOptions)
    }

    (this.tether as Tether).position()
  }
}

export default TetherComponent
