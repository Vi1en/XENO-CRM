declare module 'swagger-ui-react' {
  import { ComponentType } from 'react'
  
  interface SwaggerUIProps {
    url?: string
    spec?: any
    deepLinking?: boolean
    displayOperationId?: boolean
    defaultModelsExpandDepth?: number
    defaultModelExpandDepth?: number
    defaultModelRendering?: 'example' | 'model'
    displayRequestDuration?: boolean
    docExpansion?: 'list' | 'full' | 'none'
    filter?: boolean | string
    showExtensions?: boolean
    showCommonExtensions?: boolean
    tryItOutEnabled?: boolean
    requestInterceptor?: (request: any) => any
    responseInterceptor?: (response: any) => any
    onComplete?: () => void
    onFailure?: (error: any) => void
    [key: string]: any
  }
  
  const SwaggerUI: ComponentType<SwaggerUIProps>
  export default SwaggerUI
}
