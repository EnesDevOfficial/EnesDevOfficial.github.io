import { assetUrl } from '../content'

type Props = { src: string; label: string; className: string; lazy?: boolean }

export default function Thumb({ src, label, className, lazy }: Props) {
  return src ? (
    <img className={className} src={assetUrl(src)} alt="" loading={lazy ? 'lazy' : undefined} />
  ) : (
    <div className={`${className} empty`} aria-hidden="true">
      {label[0]}
    </div>
  )
}
