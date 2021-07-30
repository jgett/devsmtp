(function($){
    $.fn.devsmtp = function(options){
        return this.each(function(){
            var $this = $(this);
            
            var opts = $.extend({"templates": null, "wsurl": null}, options);
            
            var getAlert = function(msg) {
                return $("<div/>", {"class": "alert alert-danger", "role": "alert"}).html(msg);
            };
            
            var showMissingRequiredOptionAlert = function(name) {
                $this.html(getAlert("Unable to configure devsmtp. Missing required option: " + name));
            };
            
            if (!opts.templates){
                showMissingRequiredOptionAlert("templates");
                return;
            }
            
            if (!opts.wsurl){
                showMissingRequiredOptionAlert("wsurl");
                return;
            }
            
            const ws = new WebSocket(opts.wsurl);
            
            var data = null;
            
            var getMessage = function(id) {
                var result = data.inbox.filter(function(x) {
                    return x.id === id;
                });
                
                if (result.length > 0)
                    return result[0];
                else
                    return null;
            };
            
            ws.onmessage = function(msg) {
                data = JSON.parse(msg.data);
                $(".inbox", $this).html(opts.templates.inbox(data));
            };
            
            $this.on("click", ".delete-all-button", function(e){
                ws.send(JSON.stringify({"command": "delete-all"}));
            }).on("click", ".delete-button", function(e){
                e.preventDefault();
                var id = $(this).data("message-id");
                if (id) {
                    ws.send(JSON.stringify({"command": "delete", "id": id}));
                }
            }).on("show.bs.modal", ".message-modal", function(e){
                var modal = $(this);
                var button = $(e.relatedTarget);
                var id = button.data("message-id");
                var msg = getMessage(id);
                
                $(".message", modal).html(opts.templates.message(msg));
                $(".subject", modal).text(msg.subject);
                $(".delete-button", modal).data("message-id", id);
            });
        });
    };

})(jQuery);