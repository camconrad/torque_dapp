import { useDispatch, useSelector } from 'react-redux'
import Footer from './Footer'
import { Header } from './Header'
import { AppStore } from '@/types/store'
import { useEffect, useState } from 'react'
import { updateTheme } from '@/lib/redux/slices/theme'
import Headroom from 'react-headroom'
import InviteCodeModal from '@/components/common/Modal/InviteCodeModal'

interface MainLayoutProps {
  children: any
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const dispatch = useDispatch()
  const theme = useSelector((store: AppStore) => store.theme.theme)

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isModalChecked, setIsModalChecked] = useState(false)

  useEffect(() => {
    const inviteModalDismissed = localStorage.getItem('inviteModalDismissed')

    if (!inviteModalDismissed) {
      setIsInviteModalOpen(true)
    }
    setIsModalChecked(true)
  }, [])

  useEffect(() => {
    if (theme === '') {
      dispatch(updateTheme('light' as any))
    }

    if (typeof window !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      } else {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      }
    }
  }, [theme, dispatch])

  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false)
    localStorage.setItem('inviteModalDismissed', 'true')
  }

  if (!isModalChecked) return null 

  return (
    <div className="font-rogan-regular min-h-screen bg-[#FFFFFF] text-white dark:bg-[#030303]">
      <InviteCodeModal open={isInviteModalOpen} handleClose={handleInviteModalClose} />
      {!isInviteModalOpen && (
        <>
          <Headroom>
            <Header />
          </Headroom>
          <div className="container mx-auto min-h-[calc(100vh-140px)] max-w-[1244px] p-4 lg:p-8">
            {children}
          </div>
          <Footer />
        </>
      )}
    </div>
  )
}

// import { useDispatch, useSelector } from 'react-redux'
// import Footer from './Footer'
// import { Header } from './Header'
// import { AppStore } from '@/types/store'
// import { useEffect } from 'react'
// import { updateTheme } from '@/lib/redux/slices/theme'
// import Headroom from 'react-headroom'

// interface MainLayoutProps {
//   children: any
// }

// export const MainLayout = ({ children }: MainLayoutProps) => {
//   const dispatch = useDispatch()
//   const theme = useSelector((store: AppStore) => store.theme.theme)

//   useEffect(() => {
//     if (theme === '') {
//       dispatch(updateTheme('light' as any))
//     }

//     if (typeof window !== 'undefined') {
//       if (theme === 'light') {
//         document.documentElement.classList.remove('dark')
//         document.documentElement.classList.add('light')
//       } else {
//         document.documentElement.classList.add('dark')
//         document.documentElement.classList.remove('light')
//       }
//     }
//   }, [theme, dispatch])

//   return (
//     <div className="font-rogan-regular min-h-screen bg-[#FFFFFF] text-white dark:bg-[#030303]">
//       <Headroom>
//         <Header />
//       </Headroom>
//       <div className="container mx-auto min-h-[calc(100vh-140px)] max-w-[1244px] p-4 lg:p-8">
//         {children}
//       </div>
//       <Footer />
//     </div>
//   )
// }