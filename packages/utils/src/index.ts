// Утилиты для работы с DOM
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Утилиты для безопасности
export const securityUtils = {
  sanitizeHtml: (html: string) => {
    // Реализация санитизации HTML
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  },
  
  validateEmail: (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },
  
  generateSecureToken: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
}

// Утилиты для работы с датами
export const dateUtils = {
  format: (date: Date, format = 'YYYY-MM-DD') => {
    // Реализация форматирования даты
    return date.toISOString().split('T')[0]
  },
  
  relative: (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days} дн. назад`
    if (hours > 0) return `${hours} ч. назад`
    if (minutes > 0) return `${minutes} мин. назад`
    return 'только что'
  },
}

// Утилиты для работы с числами
export const numberUtils = {
  format: (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  },
  
  abbreviate: (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  },
}