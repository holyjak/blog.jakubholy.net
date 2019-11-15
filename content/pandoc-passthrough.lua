function RawInline(el)
  return pandoc.RawInline('asciidoc', '+++' .. el.text .. '+++')
end
