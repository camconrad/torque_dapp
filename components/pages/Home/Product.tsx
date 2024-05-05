import SkeletonDefault from '@/components/skeleton'
import { AppStore } from '@/types/store'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function Product() {
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])
  const theme = useSelector((store: AppStore) => store.theme.theme)
  return (
    <div className="mt-[36px] space-y-[18px]">
      {isLoading ? (
        <div className="">
          <SkeletonDefault height={'5vh'} width={'10%'} />
        </div>
      ) : (
        <h3 className="font-rogan text-[27px] text-[#404040] dark:text-white">
          Products
        </h3>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((item, i) => {
          if (isLoading)
            return (
              <div className="">
                <SkeletonDefault height={'50vh'} width={'100%'} key={i} />
              </div>
            )
          else
            return (
              <Link
                href={item.path}
                key={i}
                className={
                  `block overflow-hidden rounded-xl border text-[#404040] transition-opacity duration-300  hover:opacity-80 dark:border-[#1A1A1A]  dark:text-white` +
                  `
                ${theme === 'light' ? ' bg-[#ffffff]' : 'bg-overview'}
                `
                }
              >
                <img
                  className="h-[170px] w-full object-cover"
                  src={theme === 'light' ? item.coverLight : item.cover}
                  alt=""
                />
                <div className="space-y-[18px] p-[24px] xs:pl-[28px] xs:pt-[32px]">
                  <div className="flex items-center justify-start">
                    <div className="flex w-auto h-auto py-4 px-4 items-center justify-center rounded-full border from-[#232323] to-[#232323]/0 dark:border-[#1A1A1A] dark:bg-gradient-to-b">
                      <img className="w-[26px]" src={item.icon} alt="" />
                    </div>
                    <p className="font-rogan ml-[10px] text-[28px]">
                      {item.name}
                    </p>
                  </div>
                  <p className="max-w-[360px] text-[#959595] text-[18px]">
                    {item.description}
                  </p>
                </div>
              </Link>
            )
        })}
      </div>
    </div>
  )
}

const products = [
  {
    name: 'Boost',
    path: '/boost',
    cover: '/assets/banners/boost-sm.png',
    coverLight: '/assets/banners/boost-light-small.png',
    icon: '/assets/overview-page/boost.svg',
    description:
      'Savings product that provides compound yield to users & bolsters DeFi ecosystem liquidity.',
  },
  {
    name: 'Borrow',
    path: '/borrow',
    cover: '/assets/banners/borrow-sm.png',
    coverLight: '/assets/banners/borrow-light-small.png',
    icon: '/assets/overview-page/borrow.svg',
    description:
      'Collateralize your portfolio & borrow up to 78% of its value so you never have to sell assets.',
  },
]
