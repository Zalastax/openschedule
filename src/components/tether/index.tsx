import { Component, Children, PropTypes } from 'react'
import * as ReactDOM from 'react-dom'
import * as Tether from 'tether'

const renderElementToPropTypes = [
  PropTypes.string,
  PropTypes.shape({
    appendChild: PropTypes.func.isRequired
  })
]

/*
const childrenPropType = ({ children }, propName, componentName) => {
  const childCount = Children.count(children)
  if (childCount <= 0) {
    return new Error(`${componentName} expects at least one child to use as the target element.`)
  } else if (childCount > 2) {
    return new Error(`Only a max of two children allowed in ${componentName}.`)
  }
}*/

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
  appendChild: Function
}


const propTypes = {
    renderElementTag: PropTypes.string,
    renderElementTo: PropTypes.oneOfType(renderElementToPropTypes),
    // attachment: PropTypes.oneOf(attachmentPositions).isRequired,
    // targetAttachment: PropTypes.oneOf(attachmentPositions),
    offset: PropTypes.string,
    targetOffset: PropTypes.string,
    targetModifier: PropTypes.string,
    enabled: PropTypes.bool,
    classes: PropTypes.object,
    classPrefix: PropTypes.string,
    optimizations: PropTypes.object,
    constraints: PropTypes.array,
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onUpdate: PropTypes.func,
    onRepositioned: PropTypes.func,
   // children: childrenPropType
  }
console.log(propTypes)

interface RequiredTetherProps {
  attachment: attachmentPositions
  renderElementTag: string
  renderElementTo: RenderElementTo
}

interface OptionalTetherProps {
  renderElementTo?: RenderElementTo
  targetAttachement?: attachmentPositions
  offset?: string
  targetOffset?: string
  targetModifier?: string
  enabled?: boolean
  classes?: {}
  classPrefix?: string
  optimizations?: {}
  constraints?: any[]
  id?: string
  className?: string
  style?: {}
  onUpdate?: Function
  onRepositioned?: Function
}

type TetherProps = RequiredTetherProps & OptionalTetherProps

interface ConstructorTetherProps {
  attachment: attachmentPositions
  renderElementTag?: string
  renderElementTo?: RenderElementTo
}

const defaultProps = {
  renderElementTag: 'div',
  renderElementTo: null
}

new TetherComponent({

})
class TetherComponent extends Component<TetherProps, void> {

  constructor(props: ConstructorTetherProps & OptionalTetherProps) {
    super({...defaultProps, ...props})
  }

  private targetNode?: Element = undefined
  private elementParentNode?:Element = undefined
  public tether?: Tether = undefined

  componentDidMount() {
    this.targetNode = ReactDOM.findDOMNode(this as React.ReactInstance)
    this._update()
    this.registerEventListeners()
  }

  componentDidUpdate(_prevProps: TetherProps) {
    this._update()
  }

  componentWillUnmount() {
    this._destroy()
  }
  
  private registerEventListeners() {
    if (this.props.onUpdate && this.tether != null) {
      this.tether.on('update', this.props.onUpdate);
    }
    if (this.props.onRepositioned && this.tether != null) {
      this.tether.on('repositioned', this.props.onRepositioned);
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

  _destroy() {
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

  _update() {
    const { children, renderElementTag } = this.props
    const elementComponent = Children.toArray(children)[1]

    // if no element component provided, bail out
    if (!elementComponent) {
      // destroy Tether element if it has been created
      if (this.tether) {
        this._destroy()
      }
      return
    }

    // create element node container if it hasn't been yet
    if (this.elementParentNode == null) {
      // create a node that we can stick our content Component in
      this.elementParentNode = document.createElement(renderElementTag)

      // append node to the render node
      this.renderNode.appendChild(this.elementParentNode)
    }

    // render element component into the DOM
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this, elementComponent, this.elementParentNode, () => {
        // don't update Tether until the subtree has finished rendering
        this.updateTether()
      }
    )
  }

  private updateTether() {
    const { id, className, style, ...options } = this.props
    const tetherOptions = {
      target: this.targetNode,
      element: this.elementParentNode,
      ...options
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
        Object.keys(style).forEach(key => {
          pn.style[key] = style[key]
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

  public render() {
    return Children.toArray(this.props.children)[0] as React.ReactElement
  }
}

export default TetherComponent