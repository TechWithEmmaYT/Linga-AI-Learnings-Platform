import Link from 'next/link'
import Image from 'next/image'

const Logo = ({ url = "/" }: { url?: string }) => {
  return (
    <Link href={url} className="flex items-center gap-x-3 pl-4">
      <Image src="/images/logo.png" alt="Linga.ai" height={30} width={30} />
      <h1 className="text-2xl font-bold tracking-wide text-primary">
        Linga.ai
      </h1>
    </Link>
  )
}

export default Logo
