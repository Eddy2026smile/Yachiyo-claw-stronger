const HTTP_EXPLANATIONS: Record<number, string> = {
  400: '请求参数无效。请检查模型名称、接口格式和提供商设置。',
  401: 'API 密钥无效或已过期。请检查密钥后重试。',
  402: '账户余额或额度不足。请检查提供商的计费状态。',
  403: '当前 API 密钥没有访问此模型或接口的权限。',
  404: '找不到请求的模型或接口。请检查模型 ID 和 API 地址。',
  408: '请求超时。请检查网络连接，或稍后重试。',
  409: '请求与服务端当前状态冲突。请稍后重试。',
  413: '请求内容过大。请减少上下文、附件或图片大小。',
  422: '服务端无法处理请求参数。请检查模型能力和参数设置。',
  429: '请求过于频繁或额度暂时受限。请稍后重试。',
  500: '提供商内部错误。这通常是临时故障，请稍后重试。',
  501: '提供商尚未支持此接口或功能。',
  502: '提供商网关收到无效响应。这通常是临时故障。',
  503: '提供商服务暂时不可用，可能正在维护或过载。',
  504: '提供商网关等待上游响应超时。请稍后重试。',
}

const LOCAL_MODEL_EXPLANATIONS: Array<[RegExp, string]> = [
  [/local_model_gguf_shards_incomplete/, 'GGUF 分片组不完整。请返回下载管理，补齐或重新下载此模型的全部分片后再加载。'],
  [/local_model_gguf_invalid/, 'GGUF 文件头无效或文件已损坏。请重新下载模型，并确认下载校验通过。'],
  [/local_model_not_(?:gguf|litertlm|chat_model)/, '所选文件格式与本地聊天运行时不匹配。GGUF 请使用 .gguf 文件，LiteRT-LM 请使用 .litertlm 文件。'],
  [/local_model_(?:not_downloaded|file_missing)|local_model_not_available/, '本地模型文件不可用。请在下载管理确认文件已完整下载，然后重新加载模型。'],
  [/local_model_memory_insufficient/, '设备可用内存不足，无法安全加载该本地模型。请关闭其他应用，或选择更小、量化程度更高的模型。'],
  [/local_acceleration_backends_unavailable|local_npu_runtime_unavailable/, '本地模型的加速后端不可用。请在本地模型设置中选择 CPU 后重试；若 CPU 也失败，请换用较小或兼容的模型文件。'],
  [/local_model_chat_template/, '本地模型的聊天模板暂不受支持。请换用带标准 ChatML/Gemma 模板的 GGUF。'],
  [/local_inference_process_crashed/, '本地推理进程异常退出。已尝试可用的安全后备配置；请尝试更小的模型或量化版本，并将运行后端设为 CPU。'],
  [/local_inference_(?:start_)?timeout|local_inference_timeout/, '本地模型启动或响应超时。首次加载较大的模型可能需要更久；请稍后重试，或使用更小的模型。'],
  [/local_model_load_failed|local_inference_failed/, '本地模型加载失败。请先卸载模型、确认下载完整后重试；若仍失败，请在本地模型设置中切换为 CPU，或尝试更小的模型。'],
]

export function explainRequestError(error: string, responseBody = '', status?: number): string {
  if (status && HTTP_EXPLANATIONS[status]) return HTTP_EXPLANATIONS[status]
  const value = `${error}\n${responseBody}`.toLowerCase()
  if (/invalid[_ -]?api[_ -]?key|incorrect api key|authentication|unauthori[sz]ed/.test(value)) {
    return HTTP_EXPLANATIONS[401]
  }
  if (/insufficient[_ -]?quota|billing|payment|credit|balance/.test(value)) return HTTP_EXPLANATIONS[402]
  if (/model.{0,40}(not found|does not exist|unknown)|unknown model/.test(value)) return HTTP_EXPLANATIONS[404]
  if (/rate[_ -]?limit|too many requests|resource exhausted/.test(value)) return HTTP_EXPLANATIONS[429]
  if (/context[_ -]?length|maximum context|prompt is too long|token.{0,20}(exceed|limit)/.test(value)) {
    return '对话已超过模型上下文上限。请压缩上下文、减少附件或新建对话。'
  }
  if (/certificate|ssl|tls|handshake/.test(value)) {
    return 'TLS 安全连接失败。请检查系统时间、证书、代理和 API 地址。'
  }
  const localModelExplanation = LOCAL_MODEL_EXPLANATIONS.find(([pattern]) => pattern.test(value))
  if (localModelExplanation) return localModelExplanation[1]
  if (/timeout|timed out/.test(value)) return HTTP_EXPLANATIONS[408]
  return '请求未能完成。请查看下方错误详情，检查网络、API 地址、密钥和模型设置后重试。'
}

export function parseHttpStatus(error: string, extraStatus?: unknown): number | undefined {
  if (typeof extraStatus === 'number' && extraStatus >= 400 && extraStatus <= 599) return extraStatus
  if (typeof extraStatus === 'string' && /^\d{3}$/.test(extraStatus)) {
    const parsed = Number(extraStatus)
    if (parsed >= 400 && parsed <= 599) return parsed
  }
  const match = error.match(/(?:status code|http)\s*:?[-\s]*(\d{3})/i)
  return match ? Number(match[1]) : undefined
}
