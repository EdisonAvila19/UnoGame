import { type Color, COLORS } from '../game/deck'

type ColorModalProps = {
  readonly changeColor: (color: Color) => void
}

export function ColorModal ({ changeColor }: ColorModalProps)  {

  return (
    <div className="modal">
      <div className='modal-background'></div>
      <div className='modal-content'>
        <h2>Elige un color</h2>
        <div >
          {COLORS.map((color) => (
            <button key={color} onClick={() => changeColor(color)} style={{background: color}} ></button>
          ))}
        </div>
      </div>
    </div>
  )
}