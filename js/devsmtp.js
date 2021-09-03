(function($){
    $.fn.devsmtp = function(options){
        return this.each(function(){
            var $this = $(this);
            
            var opts = $.extend({"templates": null, "wsurl": null}, options);
            
            var getAlert = function(msg) {
                return $("<div/>", {"class": "alert alert-danger alert-dismissible fade show", "role": "alert"})
                    .append(msg)
                    .append($('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'));
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
            
            var data = null;
            var isOpen = false;
            
            const ws = new WebSocket(opts.wsurl);
            
            var getMessage = function(id) {
                var result = data.inbox.filter(function(x) {
                    return x.id === id;
                });
                
                if (result.length > 0)
                    return result[0];
                else
                    return null;
            };
            
            ws.onopen = function(e) {
                isOpen = true;
            };
            
            ws.onmessage = function(msg) {
                data = JSON.parse(msg.data);
                $(".inbox", $this).html(opts.templates.inbox(data));
            };
            
            ws.onerror = function(err) {
                var alert = getAlert("A websocket error occurred. Is the service running?");
                $this.prepend(alert);
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