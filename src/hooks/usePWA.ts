import { useRegisterSW } from "virtual:pwa-register/react"
import { useMount } from "react-use"
import { useToast } from "./useToast"

export function usePWA() {
  const toaster = useToast()
  const { updateServiceWorker, needRefresh: [needRefresh] } = useRegisterSW()

  useMount(async () => {
    const update = () => {
      updateServiceWorker().then(() => localStorage.setItem("updated", "1"))
    }
    await delay(1000)
    if (localStorage.getItem("updated")) {
      localStorage.removeItem("updated")
      toaster("Cập nhật thành công, hãy khám phá phiên bản mới!", {
        action: {
          label: "Xem thay đổi",
          onClick: () => {
            window.open(`${Homepage}/releases/tag/v${Version}`)
          },
        },
      })
    } else if (needRefresh) {
      if (!navigator) return

      if ("connection" in navigator && !navigator.onLine) return

      const resp = await myFetch("/latest")

      if (resp.v && resp.v !== Version) {
        toaster("Có phiên bản mới, ứng dụng sẽ tự động cập nhật sau 5 giây", {
          action: {
            label: "Cập nhật ngay",
            onClick: update,
          },
          onDismiss: update,
        })
      }
    }
  })
}
