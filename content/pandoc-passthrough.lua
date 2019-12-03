function RawInline(el)
  return pandoc.RawInline('asciidoc', '+++' .. el.text .. '+++')
end
function RawBlock(el)
  if el.format == 'html' and el.text:match("<!--") then
    return pandoc.RawBlock('asciidoc', '\n++++' .. el.text .. '++++\n')
  end
end
