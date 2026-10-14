import Reveal from './Reveal'

export default function Title({ eyebrow, text, as: Heading = 'h2' }: { eyebrow: string; text: string; as?: 'h1' | 'h2' }) {
  return (
    <>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {text && (
        <Heading>
          <Reveal text={text} />
        </Heading>
      )}
    </>
  )
}
